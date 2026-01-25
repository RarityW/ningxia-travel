package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
)

func main() {
	// 尝试不带 token 访问，admin 接口可能会返回 401，但也证明服务在运行
	// 如果我们只是想看服务是否崩了
	resp, err := http.Get("http://localhost:8080/api/v1/admin/merchants")
	if err != nil {
		fmt.Printf("Request failed: %v\n", err)
		return
	}
	defer resp.Body.Close()

	body, _ := ioutil.ReadAll(resp.Body)
	fmt.Printf("Status: %s\n", resp.Status)
	fmt.Printf("Body: %s\n", string(body))
}
