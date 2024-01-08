# Logistic API (School project)

## Getting Started

1. Clone the repository.
2. Install dependencies: `bun install`
3. Run the application: `bun run start`
4. Access the API at `http://127.0.0.1:3000/`

## Endpoints

### Orders

- **GET /orders/**
  - Description: Get a list of all orders.
  
- **GET /orders/:id**
  - Description: Get a specific order by ID.

- **GET /orders/search**
  - Description: Search for an order.

- **GET /orders/month/:month/sales**
  - Description: Get the total sum of all orders placed in a specific month this year.

- **GET /orders/month/:month/most-expensive**
  - Description: Get the most expensive order from a specific month this year.

- **GET /orders/status/:status**
  - Description: Get a list of all orders with a specific status.
  - Status options: OrderPlaced, SearchingDriver, Delivered, Done.

- **GET /orders/status/:status/oldest**
  - Description: Get the oldest order with a specific status.

### Employees

- **GET /employees/**
  - Description: Get a list of all employees.

- **GET /employees/:id**
  - Description: Get a specific employee based on ID.

- **GET /employees/search**
  - Description: Search for employees.

- **GET /employees/date/:date**
  - Description: Get a list of employees working on a specific date.

- **GET /employees/pickers/available**
  - Description: Get a list of employees with the role of picker that are currently working.

# Search Endpoint Usage

## Overview

The search endpoints `/orders/search` and `/employees/search` is designed for filtering and sorting orders based on specific criteria. To use this endpoint, you need to include two query parameters: `filter` and optionally `sort`. Below are the details in JSON format.

## Query Parameters

### 1. `filter`

The `filter` parameter should contain an array of objects, each specifying a filtering criterion.

- Filter Item Object:

    ```json
    {
      "key": "string (optional)",
      "value": "string | number | Date",
      "query": "string (IsEqual | Before | After | SameDate | SameMonth | SameYear | Available)"
    }
    ```

### 2. `sort` (optional)

The `sort` parameter is optional and can be used to specify the sorting criteria for the results.

- Sort Item Object:

    ```json
    {
      "key": "string (Timestamp | Price)",
      "type": "string (Ascending | Descending)"
    }
    ```

## Examples

### 1. Filter by Status and Same Date

```http
GET /orders/search?filter=[{"key":"status","query":"IsEqual","value":"Done"},{"query":"SameDate","value":"2023-12-24"}]
```
#### JSON Representation:

```json
{
  "filter": [
    {"key": "status", "query": "IsEqual", "value": "Done"},
    {"query": "SameDate", "value": "2023-12-24"}
  ]
}
```

### 2. Filter by Status and Sort by Price (Descending)

```http
GET /orders/search?filter=[{"key":"status","query":"IsEqual","value":"Done"}]&sort={"key":"Price","type":"Descending"}
```
#### JSON Representation:

```json
{
  "filter": [
    {"key": "status", "query": "IsEqual", "value": "Done"}
  ],
  "sort": {"key": "Price", "type": "Descending"}
}
```


## Technologies Used

- [Bun](https://example.com/bun)
- [Elysia](https://example.com/elysia)
- [TypeScript](https://www.typescriptlang.org/)
