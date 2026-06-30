"""Authentication request/response schemas."""

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.schemas.common import ORMModel


class RegisterRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class UserRead(ORMModel):
    id: int
    name: str
    email: EmailStr
    created_at: datetime


class TokenResponse(BaseModel):
    user: UserRead
    access_token: str
    token_type: str = "bearer"
