package main

import (
	"bytes"
	"image"
	"image/color"
	"image/jpeg"
	"syscall/js"
)

func applyGrayscale(this js.Value, args []js.Value) interface{} {
	// Get the input byte array from JavaScript
	jsBytes := args[0]
	length := jsBytes.Get("length").Int()
	bytesl := make([]byte, length)
	js.CopyBytesToGo(bytesl, jsBytes)

	// Decode the input image from the byte array
	img, _, err := image.Decode(bytes.NewReader(bytesl))
	if err != nil {
		return js.ValueOf("Failed to decode image")
	}

	// Convert the image to grayscale
	grayImg := image.NewGray(img.Bounds())
	for y := 0; y < img.Bounds().Dy(); y++ {
		for x := 0; x < img.Bounds().Dx(); x++ {
			originalColor := img.At(x, y)
			grayColor := color.GrayModel.Convert(originalColor).(color.Gray)
			grayImg.Set(x, y, grayColor)
		}
	}

	// Encode the grayscale image back to a byte array
	var buf bytes.Buffer
	if err := jpeg.Encode(&buf, grayImg, nil); err != nil {
		return js.ValueOf("Failed to encode image")
	}

	// Create a Uint8Array from the Go byte slice
	jsResult := js.Global().Get("Uint8Array").New(len(buf.Bytes()))
	js.CopyBytesToJS(jsResult, buf.Bytes())

	return jsResult
}

func main() {
	js.Global().Set("applyGrayscale", js.FuncOf(applyGrayscale))
	select {}
}
