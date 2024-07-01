from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

# Load the pre-trained model and tokenizer from Hugging Face
model_name = "meta-llama/Llama-2-7b-hf"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

# Function to generate text using the LLaMA model
def generate_text(prompt):
    inputs = tokenizer(prompt, return_tensors="pt")
    outputs = model.generate(inputs['input_ids'], max_length=50)
    return tokenizer.decode(outputs[0], skip_special_tokens=True)

# Main function to take input and print generated text
def main():
    prompt = input("Enter your prompt: ")
    result = generate_text(prompt)
    print(f"Generated Text: {result}")

if __name__ == "__main__":
    main()

