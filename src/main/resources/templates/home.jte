@import org.example.Page

@param page: Page

<head>
    @if(page.description != null)
        <meta name="description" content="${page.description}">
    @endif
    <title>${page.title}</title>
</head>
<body>
    <h1>${page.title}</h1>
    <p>Welcome to my example page!</p>
</body>