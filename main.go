package main

import (
	"fmt"
	"log"
)

func main(){
	store, err:= NewPostgresStore()
	if err!=nil{
		log.Println("Error connecting to database")
	}
	err1, err2,err3 := store.init()
	if err!=nil{
		fmt.Println(err1)
	}
	if err2 != nil{
        fmt.Println(err2)
	}
	if err3 != nil{
        fmt.Println(err3)
	}
	server:= NewApiServer(":8080",store)
	server.run()
	fmt.Println("hello world")
}