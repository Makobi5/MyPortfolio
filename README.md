# MPSimon13 Portfolio

A Django-powered portfolio starter with an editable projects section.

## Setup

Create and activate the virtual environment, then install dependencies:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

Apply migrations and start the development server:

```powershell
python manage.py migrate
python manage.py runserver
```

Open http://127.0.0.1:8000/ to view the portfolio.

To manage projects, create an admin account with `python manage.py createsuperuser` and visit http://127.0.0.1:8000/admin/.

## Customize

Edit the copy and contact address in `portfolio/templates/portfolio/home.html`. Add project entries through Django admin. The color palette, layout, responsive rules, and theme toggle are in `portfolio/static/portfolio/site.css` and `site.js`.
