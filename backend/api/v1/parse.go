package v1

import "strconv"

// parseInt 将字符串转换为 int，转换失败返回 0
func parseInt(s string) int {
    i, _ := strconv.Atoi(s)
    return i
}
