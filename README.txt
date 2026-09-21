ALGORITHM & QUIZ LAB - VERSION 5

Νέα:
- Predict Next Step mode
- Ερωτήσεις πρόβλεψης σε κρίσιμα βήματα
- Άμεση ανατροφοδότηση σωστό/λάθος
- Αυτόματο Trace Table
- Ξεχωριστό trace format για:
  * Bubble Sort
  * Selection Sort
  * Binary Search
- Διατηρούνται:
  * highlighted ψευδοκώδικας
  * live μεταβλητές
  * step-by-step
  * auto run
  * random values
  * custom values
  * reset

Πρόταση χρήσης στην τάξη:
1. Ενεργοποίησε Predict Mode.
2. Πάτησε «Επόμενο βήμα».
3. Ζήτησε πρώτα προφορική απάντηση.
4. Ο μαθητής επιλέγει την πρόβλεψη.
5. Παρατήρησε την αλλαγή στον πίνακα και στο Trace Table.


Ενημέρωση Bubble Sort:
Η υλοποίηση ακολουθεί πλέον τη μορφή του σχολικού βιβλίου:

ΓΙΑ i ΑΠΟ 2 ΜΕΧΡΙ N
   ΓΙΑ j ΑΠΟ N ΜΕΧΡΙ i ΜΕ_ΒΗΜΑ -1
      ΑΝ A[j-1] > A[j] ΤΟΤΕ
         temp <- A[j-1]
         A[j-1] <- A[j]
         A[j] <- temp
      ΤΕΛΟΣ_ΑΝ
   ΤΕΛΟΣ_ΕΠΑΝΑΛΗΨΗΣ
ΤΕΛΟΣ_ΕΠΑΝΑΛΗΨΗΣ

Έχουν προσαρμοστεί αντίστοιχα:
- η πραγματική εκτέλεση,
- οι τιμές i και j,
- το Predict Mode,
- το Trace Table,
- το highlighting του ψευδοκώδικα.
