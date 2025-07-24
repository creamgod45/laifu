@import laifu.fu.lai.Page
@import gg.jte.runtime.Template
@import gg.jte.Content
@param Page page

@template.layout(page.getTitle(), @`<p>Welcome, ${page.getUser()}.</p>`)