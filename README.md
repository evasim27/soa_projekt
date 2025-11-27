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



