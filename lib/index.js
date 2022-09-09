'use strict'

// The name of the package in order to give the Antora logger a useful name
const { name: packageName } = require('../package.json')

function register({ config: { componentName = 'training', ...unknownOptions } }) {
  if (Object.keys(unknownOptions).length) {
    const keys = Object.keys(unknownOptions)
    throw new Error(`Unrecognized option${keys.length > 1 ? 's' : ''} specified for ${packageName}: ${keys.join(', ')}`)
  }

  this.on('navigationBuilt', async ({ contentCatalog, navigationCatalog }) => {
    contentCatalog.getComponents()
      .filter((component) => {
        return component.latest &&
          component.latest.asciidoc &&
          component.latest.asciidoc.attributes &&
          component.latest.asciidoc.attributes['page-component'] === componentName
      }).forEach((component) => {
      const componentNavigation = navigationCatalog.getNavigation(component.name, component.latest.version)
      if (componentNavigation && componentNavigation.length > 0) {
        componentNavigation[0].items.forEach((item) => {
          if (item.urlType === 'internal') {
            const pages = contentCatalog.getPages((page) => page.pub && page.pub.url === item.url)
            if (pages && pages.length > 0) {
              const page = pages[0]
              if (page.asciidoc && page.asciidoc.attributes && page.asciidoc.attributes['page-quiz'] === '') {
                item['asciidoc'] = {
                  attributes: {
                    'page-slug': page.asciidoc.attributes['page-slug']
                  }
                }
              }
            }
          }
        })
      }
    })
  })
}
