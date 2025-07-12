package main

import (
	"time"

	"golang.org/x/crypto/bcrypt"
)

type User struct {
    ID             uint         `gorm:"primaryKey" json:"id"`
    Name           string       `json:"name"`
    Email          string       `gorm:"unique;not null" json:"email"`
    Password       string       `gorm:"not null" json:"-"`
    Location       string       `json:"location,omitempty"`
    ProfilePic     []byte       `gorm:"type:bytea" json:"-"` // avoid base64 in response
    IsPublic       bool         `gorm:"default:true" json:"is_public"`
    Role           string       `gorm:"default:user" json:"role"`
    CreatedAt      time.Time    `json:"created_at"`
    UpdatedAt      time.Time    `json:"updated_at"`

    SkillsOffered  []Skill      `gorm:"many2many:user_skills" json:"skills_offered"`
    SkillsWanted   []Skill      `gorm:"many2many:user_wanted_skills" json:"skills_wanted"`

    Availability string `json:"availability"`
}

type Skill struct {
    ID   uint   `json:"id"`
    Name string `json:"name"`
}

type Availability struct {
    ID       uint   `json:"id"`
    Schedule string `json:"schedule"`
}
type Request struct {
    ID                uint      `json:"id"`
    RequesterID       uint      `json:"requester_id"`
    ReceiverID        uint      `json:"receiver_id"`
    Status            string    `json:"status"`
    CreatedAt         time.Time `json:"created_at"`
    UpdatedAt         time.Time `json:"updated_at"`

    RequesterRating   int       `json:"requester_rating,omitempty"`
    ReceiverRating    int       `json:"receiver_rating,omitempty"`
    RequesterComment  string    `json:"requester_comment,omitempty"`
    ReceiverComment   string    `json:"receiver_comment,omitempty"`
}
type AdminLog struct {
    ID           uint      `gorm:"primaryKey"`
    AdminID      uint      `gorm:"not null"`
    TargetUserID uint      `gorm:"not null"`
    Action       string    `gorm:"not null"` // e.g., "ban", "reject_description"
    Message      string
    CreatedAt    time.Time

    Admin        User `gorm:"foreignKey:AdminID"`
    TargetUser   User `gorm:"foreignKey:TargetUserID"`
}



type UserResponse struct {
	ID             uint         `json:"id"`
	Name           string       `json:"name"`
	Email          string       `json:"email"`
	Location       string       `json:"location"`
	IsPublic       bool         `json:"is_public"`
	Role           string       `json:"role"`
	Availability   Availability `json:"availability"`
	CreatedAt      time.Time    `json:"created_at"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}
type UpdateSkillsByNameRequest struct {
	SkillsOffered []string `json:"skills_offered"`
	SkillsWanted  []string `json:"skills_wanted"`
}
type SwapRequest struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	RequesterID   uint      `json:"requester_id"`
	ReceiverID    uint      `json:"receiver_id"`
	OfferedSkill  string    `json:"offered_skill"` // plain text skill from requester
	WantedSkill   string    `json:"wanted_skill"`  // plain text skill from receiver
	Message       string    `json:"message"`
	Status        string    `gorm:"default:'pending'" json:"status"` // pending, accepted, declined
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`

	Requester User `gorm:"foreignKey:RequesterID" json:"-"`
	Receiver  User `gorm:"foreignKey:ReceiverID" json:"-"`
}
type CreateSwapRequestInput struct {
	ReceiverID   uint   `json:"receiver_id" binding:"required"`
	OfferedSkill string `json:"offered_skill" binding:"required"`
	WantedSkill  string `json:"wanted_skill" binding:"required"`
	Message      string `json:"message"`
}


func HashPassword(pass string) (string, error){
  pin,err:=bcrypt.GenerateFromPassword([]byte(pass),bcrypt.DefaultCost)
  if err!=nil{
		return "",err
  } 
  return string(pin),nil   
}

type UserCreateRequest struct {
	Name          string   `json:"name"`
	Email         string   `json:"email"`
	Password      string   `json:"password"`
	Location      string   `json:"location"`
	IsPublic      bool     `json:"is_public"`
	Availability  string   `json:"availability"`
	SkillsOffered []string `json:"skills_offered"`
	SkillsWanted  []string `json:"skills_wanted"`
}
