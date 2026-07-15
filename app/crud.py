# I imported SQLAlchemy's select tool for database queries.
from sqlalchemy import select

# I imported the database session type.
from sqlalchemy.orm import Session

# I imported my database models and API schemas.
from app import models, schemas


# I retrieved all requirements from the database.
def get_requirements(
    database: Session,
) -> list[models.Requirement]:
    query = select(models.Requirement).order_by(
        models.Requirement.requirement_key
    )

    return list(database.scalars(query).all())


# I retrieved one requirement using its database ID.
def get_requirement(
    database: Session,
    requirement_id: int,
) -> models.Requirement | None:
    return database.get(
        models.Requirement,
        requirement_id,
    )


# I searched for a requirement using its engineering-facing ID.
def get_requirement_by_key(
    database: Session,
    requirement_key: str,
) -> models.Requirement | None:
    query = select(models.Requirement).where(
        models.Requirement.requirement_key == requirement_key
    )

    return database.scalar(query)


# I created and saved a new requirement.
def create_requirement(
    database: Session,
    requirement_data: schemas.RequirementCreate,
) -> models.Requirement:
    # I converted the validated API data into a database object.
    requirement = models.Requirement(
        **requirement_data.model_dump()
    )

    # I staged the requirement to be saved.
    database.add(requirement)

    # I permanently saved the requirement.
    database.commit()

    # I refreshed the object with its database-generated values.
    database.refresh(requirement)

    return requirement


# I updated the selected fields of an existing requirement.
def update_requirement(
    database: Session,
    requirement: models.Requirement,
    requirement_data: schemas.RequirementUpdate,
) -> models.Requirement:
    # I extracted only the fields included in the request.
    updates = requirement_data.model_dump(
        exclude_unset=True
    )

    # I applied each provided change to the requirement.
    for field_name, value in updates.items():
        setattr(
            requirement,
            field_name,
            value,
        )

    # I permanently saved the changes.
    database.commit()

    # I refreshed the updated database object.
    database.refresh(requirement)

    return requirement


# I permanently deleted a requirement.
def delete_requirement(
    database: Session,
    requirement: models.Requirement,
) -> None:
    # I marked the requirement for deletion.
    database.delete(requirement)

    # I permanently saved the deletion.
    database.commit()