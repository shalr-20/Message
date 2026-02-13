# Start the website

Quick ways to run this static site from the project root:

- Using Node (recommended if you have Node installed):

```bash
npm start
```

This runs `server.js` (default port `8080`) and opens `index.html` in your browser.

- On Windows, you can also double-click `start-website.bat` to run the same `npm start` command.

If you don't have Node, you can serve the folder with Python:

```bash
python -m http.server 8000
# then open http://localhost:8000/index.html
```