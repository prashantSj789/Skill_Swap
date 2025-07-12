package main

import (
	"database/sql"
	"errors"
	"fmt"
	"log"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)


type storage interface{
   CreateUser(*User)error 
   GetUserByEmail(string)(*User, error)
   GetAllPublicUsersExcluding(currentUserID uint, users *[]User) error
   UpdateUserSkillsByNames(userID uint, offeredNames, wantedNames []string) error
   SearchUsersBySkill(skillQuery string, excludeUserID *uint) ([]User, error)
   CreateSwapRequest(*SwapRequest) error
   HasPendingRequest(requesterID, receiverID uint) bool
   GetReceivedRequestsByUserID(userID uint) ([]SwapRequest, error)
   GetSwapRequestByID(id uint, req *SwapRequest) error
   UpdateSwapRequest(req *SwapRequest) error

}

type PostgresStore struct{
	DB *gorm.DB
	SqlDB *sql.DB
	DSN string
}


func NewPostgresStore() (*PostgresStore,error) {
    dsn := "postgresql://postgres:TdUptzmljvdRvZsVJDoUuUmoFRzHmaZR@ballast.proxy.rlwy.net:35071/railway"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
		return nil,err
	}
	sqlDB, err := db.DB()
	if err != nil {
		log.Fatal("Failed to access sql.DB:", err)
		return nil,err
	}
	sqlDB.SetMaxOpenConns(20)               
	sqlDB.SetMaxIdleConns(10)                
	sqlDB.SetConnMaxLifetime(30 * time.Minute)
	return &PostgresStore{
		DB: db,SqlDB: sqlDB,DSN: dsn,
	},nil
}
func (s *PostgresStore) init() (error,error,error){
    return s.CreateUserTable(),s.CreateAdminLog(),s.createRequestTable()
}

func (s *PostgresStore) CreateUserTable() error{
	 err := s.DB.AutoMigrate(&User{})
	 if err!=nil{
		return err
	 }
	 return nil     
}
func (s *PostgresStore) createRequestTable() error{
	 err := s.DB.AutoMigrate(&SwapRequest{})
	 if err!=nil{
		return err
	 }
	 return nil 	
}
func (s *PostgresStore) CreateAdminLog() error{
	 err := s.DB.AutoMigrate(&AdminLog{})
	 if err!=nil{
		return err
	 }
	 return nil     
}
func (s *PostgresStore) CreateUser(user *User) error{
	if err := s.DB.Create(user).Error; err != nil {
		return err
	}
	return nil
}


func (s *PostgresStore) GetUserByEmail(email string) (*User, error) {
	var user User
	result := s.DB.Where("email = ?", email).First(&user)
	if result.Error != nil {
		return nil, result.Error
	}
	return &user, nil
}

func (s *PostgresStore) GetAllPublicUsersExcluding(currentUserID uint, users *[]User) error {
	return s.DB.
		Preload("SkillsOffered").
		Preload("SkillsWanted").
		Where("is_public = ? AND id != ?", true, currentUserID).
		Find(users).Error
}

func (s *PostgresStore) UpdateUserSkillsByNames(userID uint, offeredNames, wantedNames []string) error {
	var user User
	if err := s.DB.Preload("SkillsOffered").Preload("SkillsWanted").First(&user, userID).Error; err != nil {
		return err
	}

	getSkills := func(names []string) ([]Skill, error) {
		var skills []Skill
		for _, name := range names {
			var skill Skill
			if err := s.DB.Where("LOWER(name) = LOWER(?)", name).First(&skill).Error; err != nil {
				if errors.Is(err, gorm.ErrRecordNotFound) {
					skill = Skill{Name: name}
					if err := s.DB.Create(&skill).Error; err != nil {
						return nil, err
					}
				} else {
					return nil, err
				}
			}
			skills = append(skills, skill)
		}
		return skills, nil
	}

	offeredSkills, err := getSkills(offeredNames)
	if err != nil {
		return err
	}
	wantedSkills, err := getSkills(wantedNames)
	if err != nil {
		return err
	}

	// Replace associations
	if err := s.DB.Model(&user).Association("SkillsOffered").Replace(offeredSkills); err != nil {
		return err
	}
	if err := s.DB.Model(&user).Association("SkillsWanted").Replace(wantedSkills); err != nil {
		return err
	}

	return nil
}

func (s *PostgresStore) SearchUsersBySkill(skillQuery string, excludeUserID *uint) ([]User, error) {
	var users []User
	threshold := 0.3

	query := s.DB.
		Joins("LEFT JOIN user_skills ON users.id = user_skills.user_id").
		Joins("LEFT JOIN user_wanted_skills ON users.id = user_wanted_skills.user_id").
		Joins("LEFT JOIN skills AS offered ON user_skills.skill_id = offered.id").
		Joins("LEFT JOIN skills AS wanted ON user_wanted_skills.skill_id = wanted.id").
		Where(`
			users.is_public = true AND (
				similarity(offered.name, ?) > ? 
				OR similarity(wanted.name, ?) > ?
			)
		`, skillQuery, threshold, skillQuery, threshold).
		Order(fmt.Sprintf(
			"GREATEST(similarity(offered.name, '%s'), similarity(wanted.name, '%s')) DESC",
			skillQuery, skillQuery,
		)).
		Preload("SkillsOffered").
		Preload("SkillsWanted")

	if excludeUserID != nil {
		query = query.Where("users.id != ?", *excludeUserID)
	}

	if err := query.Find(&users).Error; err != nil {
		return nil, err
	}

	return users, nil
}
func (s *PostgresStore) HasPendingRequest(requesterID, receiverID uint) bool {
	var count int64
	s.DB.Model(&SwapRequest{}).
		Where("requester_id = ? AND receiver_id = ? AND status = ?", requesterID, receiverID, "pending").
		Count(&count)

	return count > 0
}
func (s *PostgresStore) CreateSwapRequest(req *SwapRequest) error {
	return s.DB.Create(req).Error
}

func (s *PostgresStore) GetReceivedRequestsByUserID(userID uint) ([]SwapRequest, error) {
	var requests []SwapRequest
	result := s.DB.
		Where("receiver_id = ?", userID).
		Order("created_at DESC").
		Find(&requests)
	return requests, result.Error
}
func (s *PostgresStore) GetSentRequestsByUserID(userID uint) ([]SwapRequest, error) {
	var requests []SwapRequest
	result := s.DB.
		Where("requester_id = ?", userID).
		Order("created_at DESC").
		Find(&requests)
	return requests, result.Error
}


func (s *PostgresStore) GetSwapRequestByID(id uint, req *SwapRequest) error {
	return s.DB.First(req, id).Error
}

func (s *PostgresStore) UpdateSwapRequest(req *SwapRequest) error {
	return s.DB.Save(req).Error
}

