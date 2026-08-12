"""Tests for the Expenses module (CRUD, filters, summary, search)."""

from datetime import date, timedelta

from fastapi import status

AUTH = "/api/v1/auth"
EXPENSES = "/api/v1/expenses"
SEARCH = "/api/v1/search"


def _auth_headers(client, email="expenses@example.com"):
    payload = {"name": "Spender", "email": email, "password": "supersecret123"}
    token = client.post(f"{AUTH}/register", json=payload).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def _create(client, headers, **overrides):
    body = {
        "title": "Groceries",
        "amount_cents": 2450,
        "category": "food",
        "spent_on": date.today().isoformat(),
        "note": "weekly fruits and veggies",
    }
    body.update(overrides)
    return client.post(EXPENSES, json=body, headers=headers)


def test_create_expense(client):
    headers = _auth_headers(client)
    resp = _create(client, headers)
    assert resp.status_code == status.HTTP_201_CREATED
    body = resp.json()
    assert body["title"] == "Groceries"
    assert body["amount_cents"] == 2450
    assert body["category"] == "food"


def test_create_requires_valid_fields(client):
    headers = _auth_headers(client)
    resp = client.post(
        EXPENSES,
        json={"title": "", "amount_cents": 0, "category": "food", "spent_on": "2026-07-02"},
        headers=headers,
    )
    assert resp.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_invalid_category_rejected(client):
    headers = _auth_headers(client)
    resp = _create(client, headers, category="rent")
    assert resp.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_list_order_newest_spent_on_first(client):
    headers = _auth_headers(client)
    _create(client, headers, title="Older", spent_on=(date.today() - timedelta(days=1)).isoformat())
    _create(client, headers, title="Newer", spent_on=date.today().isoformat())
    resp = client.get(EXPENSES, headers=headers)
    titles = [e["title"] for e in resp.json()]
    assert titles[0] == "Newer"


def test_get_expense(client):
    headers = _auth_headers(client)
    expense_id = _create(client, headers).json()["id"]
    resp = client.get(f"{EXPENSES}/{expense_id}", headers=headers)
    assert resp.status_code == status.HTTP_200_OK
    assert resp.json()["id"] == expense_id


def test_update_expense(client):
    headers = _auth_headers(client)
    expense_id = _create(client, headers).json()["id"]
    resp = client.patch(
        f"{EXPENSES}/{expense_id}",
        json={"title": "Supermarket", "amount_cents": 3000},
        headers=headers,
    )
    assert resp.status_code == status.HTTP_200_OK
    assert resp.json()["title"] == "Supermarket"
    assert resp.json()["amount_cents"] == 3000


def test_filter_by_category(client):
    headers = _auth_headers(client)
    _create(client, headers, title="Food", category="food")
    _create(client, headers, title="Bus", category="transport")
    resp = client.get(EXPENSES, params={"category": "transport"}, headers=headers)
    titles = [e["title"] for e in resp.json()]
    assert titles == ["Bus"]


def test_filter_by_query(client):
    headers = _auth_headers(client)
    _create(client, headers, title="Coffee", note="latte")
    _create(client, headers, title="Ticket", note="metro")
    resp = client.get(EXPENSES, params={"q": "latte"}, headers=headers)
    titles = [e["title"] for e in resp.json()]
    assert titles == ["Coffee"]


def test_filter_by_date_range(client):
    headers = _auth_headers(client)
    today = date.today()
    _create(client, headers, title="Old", spent_on=(today - timedelta(days=4)).isoformat())
    _create(client, headers, title="InRange", spent_on=(today - timedelta(days=1)).isoformat())
    resp = client.get(
        EXPENSES,
        params={
            "from": (today - timedelta(days=2)).isoformat(),
            "to": today.isoformat(),
        },
        headers=headers,
    )
    titles = [e["title"] for e in resp.json()]
    assert titles == ["InRange"]


def test_delete_expense(client):
    headers = _auth_headers(client)
    expense_id = _create(client, headers).json()["id"]
    resp = client.delete(f"{EXPENSES}/{expense_id}", headers=headers)
    assert resp.status_code == status.HTTP_204_NO_CONTENT
    assert (
        client.get(f"{EXPENSES}/{expense_id}", headers=headers).status_code
        == status.HTTP_404_NOT_FOUND
    )


def test_expenses_are_owner_scoped(client):
    owner = _auth_headers(client, email="owner_e@example.com")
    other = _auth_headers(client, email="other_e@example.com")
    expense_id = _create(client, owner, title="Private").json()["id"]
    resp = client.get(f"{EXPENSES}/{expense_id}", headers=other)
    assert resp.status_code == status.HTTP_404_NOT_FOUND


def test_summary(client):
    headers = _auth_headers(client)
    empty = client.get(f"{EXPENSES}/summary", headers=headers).json()
    assert empty == {
        "month_total_cents": 0,
        "month_count": 0,
        "latest_title": None,
        "last_updated": None,
    }
    _create(client, headers, title="Lunch", amount_cents=1200)
    _create(client, headers, title="Taxi", amount_cents=800, category="transport")
    summary = client.get(f"{EXPENSES}/summary", headers=headers).json()
    assert summary["month_total_cents"] == 2000
    assert summary["month_count"] == 2
    assert summary["latest_title"] == "Taxi"


def test_expenses_are_searchable(client):
    headers = _auth_headers(client)
    _create(client, headers, title="Pharmacy", category="health", note="vitamins")
    resp = client.get(SEARCH, params={"q": "vitamins"}, headers=headers)
    body = resp.json()
    modules = {g["module"] for g in body["groups"]}
    assert "expenses" in modules
    group = next(g for g in body["groups"] if g["module"] == "expenses")
    hit = group["hits"][0]
    assert hit["route"].startswith("/expenses/")
    assert hit["matched_field"] == "note"
