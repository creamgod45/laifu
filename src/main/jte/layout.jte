@import gg.jte.runtime.Template
@import gg.jte.Content
@param String title
@param Content content

<!DOCTYPE html>
<html>
<head>
    <title>${title}</title>
</head>
<body>
    <header>Site Header</header>

    <main>
        ${content}
    </main>

    <footer>Site Footer</footer>
</body>
</html>