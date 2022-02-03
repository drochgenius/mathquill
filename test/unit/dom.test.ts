suite('HTML', function () {
  function renderHtml(domView: DOMView) {
    const Cmd = class extends MathCommand {
      constructor() {
        super(undefined, domView);
        this.id = 1;
        this.blocks = Array(domView.childCount);
        for (let i = 0; i < domView.childCount; i += 1) {
          const content = 'Block:' + i;
          this.blocks[i] = {
            id: 2 + i,
            joinFrag: (_sibling) => {},
            html: () => {
              const frag = document.createDocumentFragment();
              frag.appendChild(h.text(content));
              return frag;
            },
          } as MathBlock;
        }
      }
    };

    return new Cmd().html();
  }

  function assertDOMEqual(
    actual: Element | DocumentFragment,
    expected: string,
    message: string
  ) {
    const expectedNode = parseHTML(expected);
    if (actual.isEqualNode(expectedNode)) return;

    const d = document.createElement('div');
    d.appendChild(actual);
    const actualString = d.innerHTML;

    assert.fail(
      message + ' expected (' + actualString + ') to equal (' + expected + ')'
    );
  }

  test('simple HTML templates', function () {
    assertDOMEqual(
      renderHtml(new DOMView(0, () => h('span', {}, [h.text('A Symbol')]))),
      '<span aria-hidden="true">A Symbol</span>',
      'a symbol'
    );

    assertDOMEqual(
      renderHtml(new DOMView(1, (blocks) => h.block('span', {}, blocks[0]))),
      '<span aria-hidden="true" aria-hidden="true">Block:0</span>',
      'same span is cmd and block'
    );

    assertDOMEqual(
      renderHtml(
        new DOMView(2, (blocks) =>
          h('span', {}, [
            h.block('span', {}, blocks[0]),
            h.block('span', {}, blocks[1]),
          ])
        )
      ),
      '<span aria-hidden="true">' +
        '<span aria-hidden="true">Block:0</span>' +
        '<span aria-hidden="true">Block:1</span>' +
        '</span>',
      'container span with two block spans'
    );

    assertDOMEqual(
      renderHtml(new DOMView(0, () => h('br'))),
      '<br aria-hidden="true"/>',
      'self-closing tag'
    );
  });

  test('templates returning a fragment', function () {
    assertDOMEqual(
      renderHtml(
        new DOMView(2, (blocks) => {
          const frag = document.createDocumentFragment();
          frag.appendChild(h('span', {}, [h.block('span', {}, blocks[0])]));
          frag.appendChild(h('span', {}, [h.block('span', {}, blocks[1])]));
          return frag;
        })
      ),
      '<span aria-hidden="true">' +
        '<span aria-hidden="true">Block:0</span>' +
        '</span>' +
        '<span aria-hidden="true">' +
        '<span aria-hidden="true">Block:1</span>' +
        '</span>',
      'two cmd spans'
    );

    assertDOMEqual(
      renderHtml(
        new DOMView(2, (blocks) => {
          const frag = document.createDocumentFragment();
          frag.appendChild(h('span'));
          frag.appendChild(h('span'));
          frag.appendChild(
            h('span', {}, [
              h('span', {}, [h('span')]),
              h.block('span', {}, blocks[1]),
              h('span'),
            ])
          );
          frag.appendChild(h.block('span', {}, blocks[0]));
          return frag;
        })
      ),
      '<span aria-hidden="true"></span>' +
        '<span aria-hidden="true"></span>' +
        '<span aria-hidden="true">' +
        '<span><span></span></span>' +
        '<span aria-hidden="true">Block:1</span>' +
        '<span></span>' +
        '</span>' +
        '<span aria-hidden="true">Block:0</span>',
      'multiple nested cmd and block spans'
    );
  });
});
