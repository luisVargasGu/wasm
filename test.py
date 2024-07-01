from transformers import pipeline, AutoTokenizer
import torch

# Load the model and tokenizer
model_name = "PY007/TinyLlama-1.1B-Chat-v0.3"
tokenizer = AutoTokenizer.from_pretrained(model_name)
pipeline_generator = pipeline(
    "text-generation",
    model=model_name,
    tokenizer=tokenizer,
    max_length=50,  # Adjust max_length as needed
    torch_dtype=torch.float16,
    device=0,  # Set device to GPU (0) or CPU (-1) as per availability
)

# Function to generate text based on input prompt
def generate_text(input_text):
    formatted_prompt = f"user\n{input_text}\nassistant\n"
    sequences = pipeline_generator(
        formatted_prompt,
        do_sample=True,
        top_k=50,
        top_p=0.9,
        num_return_sequences=1,
        repetition_penalty=1.1,
        max_new_tokens=50,  # Adjust max_new_tokens according to max_length
    )
    return sequences[0]['generated_text']

# Example usage in a synchronous environment (like testing locally)
def main():
    input_text = input("Enter your input: ")
    result = generate_text(input_text)
    print(f"Generated Text: {result}")

# For asynchronous usage (like in a WASM environment), adjust accordingly
# Example of how you might expose a function for WASM consumption:
def generate_text_wasm(input_text):
    return generate_text(input_text)

# If running in a WASM environment, you'd typically export a function like `generate_text_wasm`
# that can be called asynchronously.

if __name__ == "__main__":
    main()

