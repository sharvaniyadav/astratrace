# I imported Pydantic tools for validating API data.
from pydantic import BaseModel, ConfigDict, Field


# I defined the fields shared by requirement requests and responses.
class RequirementBase(BaseModel):
    requirement_key: str = Field(
        min_length=3,
        max_length=50,
    )

    title: str = Field(
        min_length=3,
        max_length=200,
    )

    statement: str = Field(
        min_length=5,
    )

    level: str = Field(
        min_length=2,
        max_length=50,
    )

    owner: str = Field(
        min_length=2,
        max_length=100,
    )

    verification_method: str = Field(
        min_length=2,
        max_length=50,
    )

    verification_status: str = "Not Started"
    rationale: str | None = None

    # I allowed a requirement to reference an upstream parent.
    parent_requirement_key: str | None = None


# I defined the data required to create a requirement.
class RequirementCreate(RequirementBase):
    pass


# I defined the optional fields that can be edited.
class RequirementUpdate(BaseModel):
    requirement_key: str | None = None
    title: str | None = None
    statement: str | None = None
    level: str | None = None
    owner: str | None = None
    verification_method: str | None = None
    verification_status: str | None = None
    rationale: str | None = None
    parent_requirement_key: str | None = None


# I defined the data returned by the API.
class RequirementResponse(RequirementBase):
    id: int

    # I allowed Pydantic to read SQLAlchemy objects.
    model_config = ConfigDict(from_attributes=True)