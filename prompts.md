# User Prompts Log

This file records all user prompts submitted during the development of the Singapore Bus Arrival application.

---

### Prompt 1: Initial Frontend Development
**Timestamp:** 2026-10-14 23:39 (SGT)

```text
build a singapore based bus arrival time application that tracks real time bus data using the LTA API for 5 stops near me 

build just the front end for now, i will include the backend connection later
```

---

### Prompt 2: GitHub Repository Setup & Push
**Timestamp:** 2026-10-14 23:49 (SGT)

```text
git push https://<GITHUB_PERSONAL_ACCESS_TOKEN>@https://github.com/shu-93/lta-bus-arrival.git
```
*(Token redacted for security purposes)*

---

### Prompt 3: Serverless Backend Gateway & Endpoints
**Timestamp:** 2026-10-15 00:06 (SGT)

```text
add a serverless connection that pulls live data from LTA's data mall using the following endpoints 

- store this in /api folder (project root level) not the src folder
- include /health.ts and /busarriavl.ts within that subfolder
- do not hard code any key i will include them later

GET https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=83139
# AccountKey: <LTA_ACCOUNT_KEY>
# accept: application/json
```

---

### Prompt 4: Prompt Collation
**Timestamp:** 2026-10-15 00:53 (SGT)

```text
collate the prompts that i've written thus far and store them into prompts.md file
```
