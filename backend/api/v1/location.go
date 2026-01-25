package v1

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"ningxia-wenlv-backend/utils"

	"github.com/gin-gonic/gin"
)

// GetLocation 逆地理编码 - 经纬度转城市名
func GetLocation(c *gin.Context) {
	longitude := c.Query("longitude")
	latitude := c.Query("latitude")

	if longitude == "" || latitude == "" {
		utils.ParamError(c, "缺少经纬度参数")
		return
	}

	// 高德地图逆地理编码API
	apiKey := os.Getenv("AMAP_API_KEY")
	url := fmt.Sprintf("https://restapi.amap.com/v3/geocode/regeo?key=%s&location=%s,%s",
		apiKey, longitude, latitude)

	fmt.Println("请求高德API:", url)

	// 创建HTTP客户端
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Get(url)
	if err != nil {
		fmt.Println("HTTP请求失败:", err)
		utils.ServerError(c, "获取位置信息失败")
		return
	}
	defer resp.Body.Close()

	// 读取响应
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("读取响应失败:", err)
		utils.ServerError(c, "读取位置数据失败")
		return
	}

	// 调试：打印原始响应
	fmt.Println("====高德逆地理编码API响应====")
	fmt.Println(string(body))
	fmt.Println("============================")

	// 解析高德返回的数据
	var amapResponse struct {
		Status    string `json:"status"`
		Regeocode struct {
			AddressComponent struct {
				City     string `json:"city"`
				Province string `json:"province"`
				District string `json:"district"`
			} `json:"addressComponent"`
		} `json:"regeocode"`
	}

	if err := json.Unmarshal(body, &amapResponse); err != nil {
		fmt.Println("JSON解析失败:", err)
		utils.ServerError(c, "解析位置数据失败")
		return
	}

	if amapResponse.Status != "1" {
		fmt.Println("高德API Status:", amapResponse.Status)
		utils.ServerError(c, "高德API返回错误")
		return
	}

	// 返回城市信息
	city := amapResponse.Regeocode.AddressComponent.City
	if city == "" {
		// 有些直辖市没有city字段，使用province
		city = amapResponse.Regeocode.AddressComponent.Province
	}

	utils.Success(c, gin.H{
		"city":     city,
		"province": amapResponse.Regeocode.AddressComponent.Province,
		"district": amapResponse.Regeocode.AddressComponent.District,
	})
}

// GetWeather 获取天气信息
func GetWeather(c *gin.Context) {
	city := c.DefaultQuery("city", "银川")

	// 高德天气查询API
	apiKey := os.Getenv("AMAP_API_KEY")
	url := fmt.Sprintf("https://restapi.amap.com/v3/weather/weatherInfo?key=%s&city=%s&extensions=base",
		apiKey, city)

	fmt.Println("请求高德天气API:", url)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Get(url)
	if err != nil {
		fmt.Println("HTTP请求失败:", err)
		utils.ServerError(c, "获取天气信息失败")
		return
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("读取响应失败:", err)
		utils.ServerError(c, "读取天气数据失败")
		return
	}

	// 调试：打印原始响应
	fmt.Println("====高德天气API响应====")
	fmt.Println(string(body))
	fmt.Println("======================")

	// 解析高德天气数据
	var amapWeather struct {
		Status string `json:"status"`
		Lives  []struct {
			Province      string `json:"province"`
			City          string `json:"city"`
			Weather       string `json:"weather"`
			Temperature   string `json:"temperature"`
			Winddirection string `json:"winddirection"`
			Windpower     string `json:"windpower"`
			Humidity      string `json:"humidity"`
		} `json:"lives"`
	}

	if err := json.Unmarshal(body, &amapWeather); err != nil {
		fmt.Println("JSON解析失败:", err)
		utils.ServerError(c, "解析天气数据失败")
		return
	}

	if amapWeather.Status != "1" || len(amapWeather.Lives) == 0 {
		fmt.Println("高德天气API Status:", amapWeather.Status, "Lives数量:", len(amapWeather.Lives))
		utils.ServerError(c, "高德天气API返回错误")
		return
	}

	weatherData := amapWeather.Lives[0]
	utils.Success(c, gin.H{
		"city":        weatherData.City,
		"weather":     weatherData.Weather,
		"temperature": weatherData.Temperature + "°C",
		"humidity":    weatherData.Humidity,
		"wind":        weatherData.Winddirection + weatherData.Windpower,
	})
}
