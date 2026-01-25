package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
)

func main() {
	// 1. Login to get token
	loginUrl := "http://localhost:8080/api/v1/auth/admin/login"
	loginBody := []byte(`{"username":"admin", "password":"admin123"}`)
	resp, err := http.Post(loginUrl, "application/json", bytes.NewBuffer(loginBody))
	if err != nil {
		fmt.Printf("Login failed: %v\n", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		fmt.Printf("Login failed with status: %s\n", resp.Status)
		body, _ := io.ReadAll(resp.Body)
		fmt.Println(string(body))
		return
	}

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)
	data := result["data"].(map[string]interface{})
	token := data["token"].(string)
	fmt.Println("Got token:", token)

	// 2. Create a dummy large file (15MB)
	filename := "large_test_image.jpg"
	file, err := os.Create(filename)
	if err != nil {
		fmt.Printf("Failed to create file: %v\n", err)
		return
	}
	size := 15 * 1024 * 1024
	if _, err := file.Write(make([]byte, size)); err != nil {
		fmt.Printf("Failed to write to file: %v\n", err)
		file.Close()
		return
	}
	file.Close()
	defer os.Remove(filename)

	// 3. Prepare multipart request
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, err := writer.CreateFormFile("file", filename)
	if err != nil {
		fmt.Printf("Failed to create form file: %v\n", err)
		return
	}

	f, err := os.Open(filename)
	defer f.Close()
	io.Copy(part, f)
	writer.Close()

	// 4. Send upload request
	req, err := http.NewRequest("POST", "http://localhost:8080/api/v1/admin/upload", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	req.Header.Set("Authorization", "Bearer "+token)

	client := &http.Client{}
	uploadResp, err := client.Do(req)
	if err != nil {
		fmt.Printf("Upload request failed: %v\n", err)
		return
	}
	defer uploadResp.Body.Close()

	respBody, _ := io.ReadAll(uploadResp.Body)
	fmt.Printf("Upload Status: %s\n", uploadResp.Status)
	fmt.Printf("Upload Body: %s\n", string(respBody))
}
