package ai

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

type message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type nativeRequest struct {
	Messages []message `json:"messages"`
	Stream   bool      `json:"stream"`
	IsSync   bool      `json:"is_sync"`
}

type nativeResponse struct {
	RequestID int64            `json:"request_id"`
	Response  []openAIResponse `json:"response"`
	Error     string           `json:"error"`
}

type openAIResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
}

type Client struct {
	apiKey  string
	baseURL string
	model   string
	http    *http.Client
}

func NewClient() *Client {
	return &Client{
		apiKey:  os.Getenv("GEMINI_API_KEY"),
		baseURL: os.Getenv("GEMINI_BASE_URL"),
		model:   os.Getenv("GEMINI_MODEL"),
		http:    &http.Client{},
	}
}

func (c *Client) StreamChat(w http.ResponseWriter, systemPrompt, userMessage string) error {
	messages := []message{
		{Role: "system", Content: systemPrompt},
		{Role: "user", Content: userMessage},
	}

	body, err := json.Marshal(nativeRequest{
		Messages: messages,
		Stream:   false,
		IsSync:   true,
	})
	if err != nil {
		return fmt.Errorf("marshal request: %w", err)
	}

	endpoint := fmt.Sprintf("%s/networks/%s", c.baseURL, c.model)

	req, err := http.NewRequest("POST", endpoint, bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.apiKey)

	resp, err := c.http.Do(req)
	if err != nil {
		return fmt.Errorf("do request: %w", err)
	}
	defer resp.Body.Close()

	rawBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("read body: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("api error %d: %s | url: %s", resp.StatusCode, string(rawBody), endpoint)
	}

	var result nativeResponse
	if err := json.Unmarshal(rawBody, &result); err != nil {
		return fmt.Errorf("unmarshal response: %w | body: %s", err, string(rawBody))
	}

	if len(result.Response) == 0 || len(result.Response[0].Choices) == 0 {
		return fmt.Errorf("empty response from api: %s", string(rawBody))
	}

	content := result.Response[0].Choices[0].Message.Content

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	flusher, ok := w.(http.Flusher)
	if !ok {
		return fmt.Errorf("streaming not supported")
	}

	fmt.Fprintf(w, "data: %s\n\n", content)
	flusher.Flush()

	fmt.Fprintf(w, "data: [DONE]\n\n")
	flusher.Flush()

	return nil
}
