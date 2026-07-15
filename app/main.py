# I imported Path so I can locate my frontend files.
from pathlib import Path

# I imported FastAPI tools for endpoints, database access, and errors.
from fastapi import Depends, FastAPI, HTTPException, Response

# I imported tools for serving my frontend files.
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

# I imported database error handling.
from sqlalchemy.exc import IntegrityError

# I imported the database session type.
from sqlalchemy.orm import Session

# I imported my CRUD functions, database models, and API schemas.
from app import crud, models, schemas

# I imported my database connection and session helper.
from app.database import Base, engine, get_database


# I created any database tables that do not already exist.
Base.metadata.create_all(bind=engine)


# I created the AstraTrace backend application.
app = FastAPI(
    title="AstraTrace",
    description="A fictional spacecraft requirements management application.",
    version="0.1.0",
)


# I stored the location of my frontend folder.
STATIC_DIRECTORY = Path(__file__).resolve().parent.parent / "static"


# I made the frontend files available through the backend.
app.mount(
    "/static",
    StaticFiles(directory=STATIC_DIRECTORY),
    name="static",
)


# I returned the main webpage when someone visits the homepage.
@app.get("/", include_in_schema=False)
def show_frontend():
    return FileResponse(
        STATIC_DIRECTORY / "index.html"
    )


# I created an endpoint that returns every requirement.
@app.get(
    "/api/requirements",
    response_model=list[schemas.RequirementResponse],
)
def list_requirements(
    database: Session = Depends(get_database),
):
    return crud.get_requirements(database)


# I created an endpoint that returns one requirement.
@app.get(
    "/api/requirements/{requirement_id}",
    response_model=schemas.RequirementResponse,
)
def read_requirement(
    requirement_id: int,
    database: Session = Depends(get_database),
):
    requirement = crud.get_requirement(
        database,
        requirement_id,
    )

    if requirement is None:
        raise HTTPException(
            status_code=404,
            detail="Requirement not found.",
        )

    return requirement


# I created an endpoint that saves a new requirement.
@app.post(
    "/api/requirements",
    response_model=schemas.RequirementResponse,
    status_code=201,
)
def create_requirement(
    requirement_data: schemas.RequirementCreate,
    database: Session = Depends(get_database),
):
    existing_requirement = crud.get_requirement_by_key(
        database,
        requirement_data.requirement_key,
    )

    if existing_requirement is not None:
        raise HTTPException(
            status_code=409,
            detail="A requirement with this ID already exists.",
        )

    try:
        return crud.create_requirement(
            database,
            requirement_data,
        )
    except IntegrityError:
        database.rollback()

        raise HTTPException(
            status_code=409,
            detail="A requirement with this ID already exists.",
        )


# I created an endpoint that edits an existing requirement.
@app.patch(
    "/api/requirements/{requirement_id}",
    response_model=schemas.RequirementResponse,
)
def update_requirement(
    requirement_id: int,
    requirement_data: schemas.RequirementUpdate,
    database: Session = Depends(get_database),
):
    requirement = crud.get_requirement(
        database,
        requirement_id,
    )

    if requirement is None:
        raise HTTPException(
            status_code=404,
            detail="Requirement not found.",
        )

    if requirement_data.requirement_key is not None:
        duplicate = crud.get_requirement_by_key(
            database,
            requirement_data.requirement_key,
        )

        if (
            duplicate is not None
            and duplicate.id != requirement_id
        ):
            raise HTTPException(
                status_code=409,
                detail="A requirement with this ID already exists.",
            )

    try:
        return crud.update_requirement(
            database,
            requirement,
            requirement_data,
        )
    except IntegrityError:
        database.rollback()

        raise HTTPException(
            status_code=409,
            detail="A requirement with this ID already exists.",
        )


# I created an endpoint that deletes a requirement.
@app.delete(
    "/api/requirements/{requirement_id}",
    status_code=204,
)
def delete_requirement(
    requirement_id: int,
    database: Session = Depends(get_database),
):
    requirement = crud.get_requirement(
        database,
        requirement_id,
    )

    if requirement is None:
        raise HTTPException(
            status_code=404,
            detail="Requirement not found.",
        )

    crud.delete_requirement(
        database,
        requirement,
    )

    return Response(status_code=204)