import requests
from bs4 import BeautifulSoup
import pandas as pd
import mysql.connector

# Funkcja do pobierania danych o recenzjach z Booksy
def fetch_reviews():
    """
    Ta funkcja wykonuje zapytanie HTTP do strony Booksy Twojego salonu,
    a następnie parsuje dane o recenzjach (np. imię recenzenta, tekst recenzji, ocena).
    """
    # URL strony Booksy dla Twojego salonu (przykładowy URL, musisz dostosować do swojego salonu)
    url = "https://booksy.com/pl-pl/dl/show-business/228690?utm_medium=c2c_referral"  # Zmieniony na Twój unikalny URL salonu
    
    # Nagłówki HTTP, aby zapytanie wyglądało jakby było wysyłane przez prawdziwego użytkownika
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36"
    }

    # Wykonanie zapytania HTTP
    response = requests.get(url, headers=headers)
    
    # Sprawdzenie, czy zapytanie powiodło się (status 200 oznacza sukces)
    if response.status_code == 200:
        print("Strona załadowana pomyślnie.")
    else:
        print(f"Błąd przy ładowaniu strony: {response.status_code}")
        return []  # Zwróć pustą listę w przypadku błędu

    # Parsowanie odpowiedzi HTML
    soup = BeautifulSoup(response.text, "html.parser")

    # Wyszukiwanie danych o recenzjach - przykładowe klasy CSS
    reviews = soup.find_all("div", class_="review_class_name")  # Musisz dostosować tę klasę do struktury strony
    
    review_data = []  # Lista, która będzie zawierać dane o recenzjach
    for review in reviews:
        # Dostosuj poniższe selektory do rzeczywistej struktury strony
        reviewer_name = review.find("span", class_="reviewer_name_class").get_text(strip=True)  # Klasa dla imienia
        review_text = review.find("div", class_="review_text_class").get_text(strip=True)  # Klasa dla tekstu recenzji
        review_rating = review.find("span", class_="review_rating_class").get_text(strip=True)  # Klasa dla oceny
        
        # Dodajemy dane do listy
        review_data.append([reviewer_name, review_text, review_rating])
    
    return review_data  # Zwracamy dane o recenzjach

# Funkcja do zapisania recenzji do bazy MySQL
def save_reviews_to_mysql(review_data):
    """
    Funkcja zapisuje dane o recenzjach do bazy danych MySQL.
    """
    # Połączenie z bazą danych MySQL
    connection = mysql.connector.connect(
        host="localhost",        # Adres bazy danych (zwykle localhost)
        user="your_db_user",     # Użytkownik bazy danych
        password="your_db_password",  # Hasło użytkownika bazy danych
        database="your_database"  # Nazwa bazy danych
    )

    cursor = connection.cursor()

    # Tworzenie tabeli, jeśli jeszcze nie istnieje
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS reviews (
            id INT AUTO_INCREMENT PRIMARY KEY,
            reviewer_name VARCHAR(255),
            review_text TEXT,
            review_rating INT
        )
    """)

    # Wstawianie recenzji do bazy danych
    for review in review_data:
        cursor.execute("INSERT INTO reviews (reviewer_name, review_text, review_rating) VALUES (%s, %s, %s)", review)
    
    # Zatwierdzamy zmiany i zamykamy połączenie
    connection.commit()
    cursor.close()
    connection.close()

# Funkcja główna, która łączy wszystko
def main():
    """
    Główna funkcja, która uruchamia cały proces: 
    pobiera recenzje, zapisuje do bazy danych.
    """
    # Pobieramy dane o recenzjach
    review_data = fetch_reviews()
    
    if review_data:  # Jeśli dane zostały pobrane
        # Tworzymy DataFrame Pandas z danych o recenzjach
        reviews_df = pd.DataFrame(review_data, columns=["Reviewer Name", "Review Text", "Rating"])
        print("Dane recenzji:\n", reviews_df)  # Wyświetlenie danych na konsoli (opcjonalnie)
        
        # Zapisujemy dane do bazy MySQL
        save_reviews_to_mysql(review_data)
        print("Recenzje zostały zapisane do bazy danych MySQL.")
    else:
        print("Brak danych do zapisania.")  # Jeśli nie udało się pobrać recenzji

# Uruchamiamy aplikację
if __name__ == "__main__":
    main()
