@import laifu.fu.lai.Page
@param Page page

@template.layout(title = page.getTitle(), content = @`<p>Welcome, ${page.getUser()}.</p>`)