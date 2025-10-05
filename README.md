Backend : Rust, Axum, SQLx, PostgreSQL
Frontend : Expo (Mobile App), TypeScript

/user :
- `/login` : POST
- `/register` : POST
- `/profile` : GET, PUT
- `/logout` : Remove token from client side

/expense :
- `/` : GET (List all expenses), POST (Create new expense)
- `/:id` : GET (Get expense by ID), PUT (Update expense by ID), DELETE (Delete expense by ID)

/category :
- `/` : GET (List all categories), POST (Create new category)
- `/:id` : DELETE (Delete category by ID)

/budget :
- `/` : GET (Get budget), PUT (Update budget)
- `/reset` : POST (Reset budget)


### Features
[ ] Calendar view for expenses
[ ] Spent category wise
[ ] Filter expenses by date range, category
[ ] Budget alerts
[ ] Export data to CSV
