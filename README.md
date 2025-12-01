**1) user-service**
Tehnologije:
Node.js (Express)
PostgreSQL
Port: 5001

ENDPOINTI

| Metoda     | Pot                    | Opis                                  |
| ---------- | ---------------------- | ------------------------------------- |
| **POST**   | `/users/register`      | Registracija novega uporabnika        |
| **POST**   | `/users/login`         | Prijava uporabnika                    |
| **GET**    | `/users`               | Vrne vse uporabnike                   |
| **GET**    | `/users/:id`           | Vrne uporabnika po ID                 |
| **GET**    | `/users/search?email=` | Iskanje po emailu                     |
| **GET**    | `/users/:id/role`      | Vrne vlogo uporabnika                 |
| **PUT**    | `/users/:id`           | Posodobi uporabnika                   |
| **PUT**    | `/users/:id/role`      | Posodobi vlogo (npr. user → merchant) |
| **DELETE** | `/users/:id`           | Izbriše uporabnika                    |
| **DELETE** | `/users/:id/sessions`  | Po potrebi – brisanje sej/tokenov     |


**2) merchant-service**
Tehnologije
Python (FastAPI)
PostgreSQL
Port: 5002
Dokumentacija: http://localhost:5002/docs

ENDPOINTI
| Metoda   | Pot                                                                    | Opis                                                                           |
| -------- | -----------------------------------------------------------------------| ------------------------------------------------------------------------------ |
| **POST** | `/merchants`                                                           | Ustvari merchanta + 1 začetno lokacijo (preveri user-service in nadgradi role) |
| **POST** | `/merchants/{merchant_id}/locations`                                   | Doda novo lokacijo                                                             |
| **POST** | `/merchants/{merchant_id}/locations/{location_id}/hours`               | Doda delovne ure lokaciji                                                      |
| **GET** | `/merchants`                                                            | Vrne vse merchante                                                             |
| **GET** | `/merchants/full`                                                       | Vrne vse merchante z vsemi lokacijami in urami                                 |
| **GET** | `/merchants/{merchant_id}`                                              | Vrne enega merchanta (merchant + locations + hours)                            |
| **PUT** | `/merchants/{merchant_id}`                                              | Posodobi osnovne podatke merchanta                                             |
| **PUT** | `/merchants/{merchant_id}/locations/{location_id}`                      | Posodobi lokacijo                                                              |
| **PUT** | `/merchants/{merchant_id}/locations/{location_id}/hours/{hour_id}`      | Posodobi ure                                                                   |
| **DELETE** | `/merchants/{merchant_id}`                                           | Izbriše merchanta + vse njegove lokacije + ure                                 |
| **DELETE** | `/merchants/{merchant_id}/locations/{location_id}`                   | Izbriše lokacijo                                                               |
| **DELETE** | `/merchants/{merchant_id}/locations/{location_id}/hours/{hour_id}`   | Izbriše delovne ure                                                            |

**3) payment-service**
Tehnologije
Node.js (Express)
PostgreSQL
Port: 5003
Dokumentacija: http://localhost:5003/api-docs

ENDPOINTI
| Metoda     | Pot                        | Opis                                      |
| ---------- | ---------------------------| ----------------------------------------- |
| **POST**   | `/payments/validate`       | Preveri podatke kartice (številka, datum, CVV) |
| **POST**   | `/payments/refund`         | Procesira povračilo plačila               |
| **POST**   | `/payments`                | Ustvari novo plačilo                       |
| **GET**    | `/payments/{id}`           | Vrne plačilo po ID                        |
| **GET**    | `/payments/order/{orderId}`| Vrne plačila za naročilo                  |
| **GET**    | `/payments/user/{userId}`  | Vrne plačila uporabnika                   |
| **PUT**    | `/payments/{id}/status`    | Posodobi status plačila                   |
| **PUT**    | `/payments/{id}/capture`   | Capture avtoriziranega plačila            |
| **DELETE** | `/payments/{id}`           | Izbriše plačilo                           |
| **DELETE** | `/payments/{id}/cancel`    | Prekliče plačilo                          |

Primer: ustvarjanje plačila brez podatkov o kartici

```powershell
curl -X POST http://localhost:5003/payments -H "Content-Type: application/json" -d '{"amount":9.99, "orderId": 123, "userId": 42, "currency": "EUR", "metadata": {"note": "Pickup"}}'
```

Primer: ustvarjanje plačila s podatki o kartici (validacija + ustvarjanje)

```powershell
curl -X POST http://localhost:5003/payments -H "Content-Type: application/json" -d '{"amount":9.99,"orderId":123,"userId":42,"currency":"EUR","cardNumber":"4242424242424242","expiryMonth":12,"expiryYear":2026,"cvv":"123"}'
```

**4) notification-service**
Tehnologije
Python (FastAPI)
PostgreSQL
Port: 5004
Dokumentacija: http://localhost:5004/docs

ENDPOINTI
| Metoda     | Pot                               | Opis                                               |
| ---------- | ----------------------------------| -------------------------------------------------- |
| **POST**   | `/notifications/new-offer`       | Ustvari obvestilo za novo ponudbo (kliče offer-service) |
| **POST**   | `/notifications/reservation-confirmation` | Ustvari potrditev rezervacije (kliče order-service) |
| **POST**   | `/notifications/expiration-reminder` | Ustvari opomnik za potek ponudbe                  |
| **POST**   | `/notifications/pickup-reminder` | Ustvari opomnik za prevzem                         |
| **GET**    | `/notifications`                 | Vrne uporabnikova obvestila (z paginacijo)         |
| **GET**    | `/notifications/unread`          | Vrne število neprebranih obvestil                  |
| **GET**    | `/notifications/{id}`             | Vrne specifično obvestilo                          |
| **GET**    | `/notifications/stats`            | Vrne statistiko obvestil za uporabnika             |
| **PUT**    | `/notifications/{id}/read`       | Označi obvestilo kot prebrano                      |
| **PUT**    | `/notifications/read-all`        | Označi vsa obvestila kot prebrana                  |
| **DELETE** | `/notifications/{id}`             | Izbriše obvestilo                                  |
| **DELETE** | `/notifications/bulk`             | Množično izbriše obvestila za uporabnika           |
| **DELETE** | `/notifications/read`             | Izbriše vsa prebrana obvestila za uporabnika       |
| **GET**    | `/notifications/preferences`     | Vrne nastavitve obvestil uporabnika                |
| **POST**   | `/notifications/preferences`     | Ustvari nastavitve obvestil uporabnika             |
| **PUT**    | `/notifications/preferences`     | Posodobi nastavitve obvestil uporabnika            |