const electron = require('electron')

const onElements = (selector, cb) => {
  const awaitElement = setInterval(() => {
    const els = Array.from(document.querySelectorAll(selector))
    if (els) {
      clearInterval(awaitElement)
      cb(els)
    }
  }, 512)
}

function clean (event) {
  const el = event && event.target
  if (el && el.hasAttribute && el.hasAttribute('back')) {
    return window.history.back()
  }

  const node = el && el.closest('[open-external]')

  if (node) {
    event.preventDefault()
    return electron.shell.openExternal(node.getAttribute('href'))
  }

  const actionSelector = '[aria-label="Tweet actions"] ~ div'
  const seekAndDestroy = () => onElements(actionSelector, els => {
    els.map(el => (el.closest('[role="row"]').style.display = 'none'))
  })

  const seekAndReroute = () => {
    onElements('a[target]', els => {
      els.map(el => {
        const node = el.closest('[target]')

        if (node) {
          if (node.hasAttribute('open-external')) return
          node.setAttribute('open-external', true)
        }
      })
    })
  }

  onElements('[role="main"]', els => {
    const el = els[0]
    // hide any immediately seen ads
    seekAndDestroy()
    seekAndReroute()

    // watch tweetContainer to hide new ads that get added
    const o = new window.MutationObserver(() => {
      seekAndDestroy()
      seekAndReroute()
    })

    o.observe(el, { attributes: true, childList: true })
  })
}

function preventOpen (event) {
  event.preventDefault()
  return false
}

document.addEventListener('dragover', preventOpen, false)
document.addEventListener('drop', preventOpen, false)

document.addEventListener('DOMContentLoaded', () => {
  const newheader = document.createElement('div')
  newheader.className = 'header'
  document.body.appendChild(newheader)

  const backLink = document.createElement('a')
  backLink.textContent = ' '
  backLink.setAttribute('back', true)
  backLink.className = 'backLink'

  const backLinkLeft = document.createElement('span')
  backLinkLeft.setAttribute('back', true)
  backLinkLeft.className = 'left'

  backLink.appendChild(backLinkLeft)
  document.body.appendChild(backLink)

  clean()

  document.addEventListener('click', clean)
})
