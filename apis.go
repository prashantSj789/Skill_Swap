package main

import (
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
)

type ApiServer struct{
	listenaddr string
	store  storage

}
func NewApiServer(addr string,store storage) *ApiServer{
	return &ApiServer{
       listenaddr: addr,
	   store: store,
	}
}

func (s *ApiServer) run(){
	router := gin.Default()
   	config := cors.Config{
		AllowAllOrigins:  true,
		AllowMethods:     []string{"*"},
		AllowHeaders:     []string{"*"},
		ExposeHeaders:    []string{"*"},
		AllowCredentials: false, // MUST be false when AllowAllOrigins is true
		MaxAge:           12 * time.Hour,
	}
	router.Use(cors.New(config))
	router.POST("/register",s.registerUserHandler)
	router.POST("/login", s.loginHandler)
	router.GET("/users/public", AuthMiddleware(), s.getAllPublicUsersHandler)
    router.PUT("/users/skills", AuthMiddleware(), s.updateUserSkillsByNameHandler)
	router.GET("/users/search", AuthOptionalMiddleware(), s.searchUsersBySkillHandler)
    router.POST("/request",AuthOptionalMiddleware(),s.createSwapRequest)
	router.GET("/getAllreqest",AuthOptionalMiddleware(),s.handleGetReceivedRequests)
    router.POST("/acceptRequest/:id", s.acceptSwapRequestHandler)
    router.POST("/declineRequest/:id", s.declineSwapRequestHandler)
	router.Run(s.listenaddr)     
}

func (s *ApiServer) registerUserHandler(c *gin.Context) {
	var req UserCreateRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	pin, err := HashPassword(req.Password)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	user := User{
		Name:         req.Name,
		Email:        req.Email,
		Password:     pin,
		Location:     req.Location,
		IsPublic:     req.IsPublic,
		Availability: req.Availability,
		Role:         "user",
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	if err := s.store.CreateUser(&user); err != nil {
		c.JSON(500, gin.H{"error": "Failed to create user"})
		return
	}

	// Add user skills if provided
	if err := s.store.UpdateUserSkillsByNames(user.ID, req.SkillsOffered, req.SkillsWanted); err != nil {
		c.JSON(500, gin.H{"error": "Failed to update user skills"})
		return
	}

	c.JSON(201, user)
}

func (s *ApiServer) loginHandler(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid login request"})
		return
	}

	user, err := s.store.GetUserByEmail(req.Email)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	token, err := generateJWT(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user": gin.H{
			"id":       user.ID,
			"name":     user.Name,
			"email":    user.Email,
			"location": user.Location,
		},
	})
}
func (s *ApiServer) getAllPublicUsersHandler(c *gin.Context) {
	currentUserID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var users []User
	err := s.store.GetAllPublicUsersExcluding(currentUserID.(uint), &users)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to fetch users"})
		return
	}

	c.JSON(200, gin.H{"users": users})
}
func (s *ApiServer) updateUserSkillsByNameHandler(c *gin.Context) {
	userIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID := userIDVal.(uint)

	var req UpdateSkillsByNameRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request payload"})
		return
	}

	err := s.store.UpdateUserSkillsByNames(userID, req.SkillsOffered, req.SkillsWanted)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to update skills"})
		return
	}

	c.JSON(200, gin.H{"message": "Skills updated successfully"})
}
func (s *ApiServer) searchUsersBySkillHandler(c *gin.Context) {
	query := c.Query("skill")
	if query == "" {
		c.JSON(400, gin.H{"error": "Missing skill query parameter"})
		return
	}

	var currentUserID *uint
	if uid, exists := c.Get("user_id"); exists {
		id := uid.(uint)
		currentUserID = &id
	}

	users, err := s.store.SearchUsersBySkill(query, currentUserID)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to search users"})
		return
	}

	c.JSON(200, gin.H{"users": users})
}
func (s *ApiServer) createSwapRequest(c *gin.Context) {
	var input CreateSwapRequestInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	userIDInterface, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID := userIDInterface.(uint)

	// Optional: check for duplicates
	if s.store.HasPendingRequest(userID, input.ReceiverID) {
		c.JSON(http.StatusConflict, gin.H{"error": "Request already pending"})
		return
	}

	req := SwapRequest{
		RequesterID:  userID,
		ReceiverID:   input.ReceiverID,
		OfferedSkill: input.OfferedSkill,
		WantedSkill:  input.WantedSkill,
		Message:      input.Message,
		Status:       "pending",
	}

	if err := s.store.CreateSwapRequest(&req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create request"})
		return
	}

	c.JSON(http.StatusCreated, req)
}
func (s *ApiServer) handleGetReceivedRequests(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)

	requests, err := s.store.GetReceivedRequestsByUserID(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch received requests"})
		return
	}

	c.JSON(http.StatusOK, requests)
}

func (s *ApiServer) acceptSwapRequestHandler(c *gin.Context) {
	s.updateSwapRequestStatus(c, "accepted")
}

func (s *ApiServer) declineSwapRequestHandler(c *gin.Context) {
	s.updateSwapRequestStatus(c, "declined")
}

func (s *ApiServer) updateSwapRequestStatus(c *gin.Context, status string) {
	idParam := c.Param("id")
	requestID, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request ID"})
		return
	}

	var swapRequest SwapRequest
	if err := s.store.GetSwapRequestByID(uint(requestID), &swapRequest); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Swap request not found"})
		return
	}

	if swapRequest.Status != "pending" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Request already processed"})
		return
	}

	swapRequest.Status = status
	swapRequest.UpdatedAt = time.Now()

	if err := s.store.UpdateSwapRequest(&swapRequest); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update request status"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Request " + status + " successfully"})
}





func generateJWT(userID uint) (string, error) {
	godotenv.Load()
	sec:=os.Getenv("JWTSECRET")
	var jwtSecret = []byte(sec)
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": userID,
		"exp":     time.Now().Add(72 * time.Hour).Unix(), // expires in 3 days
	})

	return token.SignedString(jwtSecret)
}
func AuthMiddleware() gin.HandlerFunc {
	godotenv.Load()
	sec:=os.Getenv("JWTSECRET")
	var jwtSecret = []byte(sec)	
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Missing or invalid Authorization header"})
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return jwtSecret, nil
		})
		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok || claims["user_id"] == nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			return
		}

		c.Set("user_id", uint(claims["user_id"].(float64)))
		c.Next()
	}
}
func AuthOptionalMiddleware() gin.HandlerFunc {
	godotenv.Load()
	sec:=os.Getenv("JWTSECRET")
	var jwtSecret = []byte(sec)		
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if strings.HasPrefix(authHeader, "Bearer ") {
			tokenString := strings.TrimPrefix(authHeader, "Bearer ")
			token, _ := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
				return jwtSecret, nil
			})
			if token != nil && token.Valid {
				if claims, ok := token.Claims.(jwt.MapClaims); ok {
					c.Set("user_id", uint(claims["user_id"].(float64)))
				}
			}
		}
		c.Next()
	}
}
