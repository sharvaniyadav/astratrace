# AstraTrace

AstraTrace is an independent educational requirements-management application developed for a fictional Earth-observation satellite mission called Aurora-1.

I built this project to better understand how software can support spacecraft systems-engineering workflows such as requirement definition, flow-down, traceability, verification planning, engineering data management, and requirement-quality review.

## Features

- Create, view, edit, and delete requirements
- Mission, system, subsystem, and component requirement levels
- Requirement ownership
- Verification method and status tracking
- Parent-child requirement traceability
- Search and filtering
- Dashboard metrics
- Rule-based requirement quality checks
- CSV export
- REST API documentation through FastAPI

## Technology

- Python
- FastAPI
- SQLAlchemy
- SQLite
- Pydantic
- HTML
- CSS
- JavaScript

## Architecture

The frontend communicates with a FastAPI REST API.

Pydantic validates data entering and leaving the API.

SQLAlchemy maps Python requirement objects to records stored in SQLite.

## Systems Engineering Context

AstraTrace models a simplified requirement lifecycle:

Mission need → system requirement → subsystem requirement → verification

The application uses parent requirement references to demonstrate requirement flow-down and traceability.

The quality checker flags wording that may be vague, non-mandatory, or difficult to verify.

## Disclaimer

This is a fictional, independent educational project. It does not reproduce or contain proprietary software, data, or workflows from any company.

## Running the Application

Activate the virtual environment:

```powershell
.venv\Scripts\Activate.ps1
