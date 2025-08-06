import json

# Load the full dictionary
with open("words_dictionary.json", "r") as f:
    all_words = json.load(f)

# Filter 5-letter alphabetic words
five_letter_words = [word.lower() for word in all_words if len(word) == 5 and word.isalpha()]

# Save to a new JSON file
with open("five_letter_words.json", "w") as f:
    json.dump(five_letter_words, f, indent=2)

print(f"{len(five_letter_words)} 5-letter words saved to five_letter_words.json")
