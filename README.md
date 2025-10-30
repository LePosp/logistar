# LogiStar (prototype)

Браузерный прототип карты (пан/зум, LOD). Старт дорожной карты инди-стратегии с логистикой.

## Запуск локально
**Вариант 1 (Python):**
```bash
cd client
python -m http.server 8080  # или py -m http.server 8080 на Windows
# открой http://localhost:8080/
```

**Вариант 2 (Node, опционально):**
```bash
npm i -g http-server
cd client
http-server -p 8080
```

## GitHub Pages (автодеплой)
- Пуш в ветку `main` автоматически публикует содержимое папки `client/` в ветку `gh-pages`.
- Включите Pages: **Settings → Pages → Deploy from branch → gh-pages**.

## Структура
```
client/
  index.html
  styles.css
  script.js
  data/
    sectors.json
    systems.json
docs/
  ONEPAGER.md
  ROADMAP.md
.github/
  workflows/deploy.yml
  ISSUE_TEMPLATE/
    bug_report.md
    feature_request.md
LICENSE
```

## Лицензия
MIT — свободно использовать, править, форкать.

–––
_2025-10-30_
