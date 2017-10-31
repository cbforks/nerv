/** @jsx createElement */
import { Component, createElement, render } from '../src'
const Empty = () => null
describe('ComponentDidCatch', () => {
  let scratch
  beforeAll(() => {
    scratch = document.createElement('div')
    document.body.appendChild(scratch)
  })

  beforeEach(() => {
    const c = scratch.firstElementChild
    if (c) {
      render(<Empty />, scratch)
    }
    scratch.innerHTML = ''
  })

  afterAll(() => {
    scratch.parentNode.removeChild(scratch)
    scratch = null
  })

  it.skip('catches render error in a boundary', () => {
    class ErrorBoundary extends Component {
      state = { error: null }
      componentDidCatch (error) {
        this.setState({ error })
      }
      render () {
        if (this.state.error) {
          return <span>{`Caught an error: ${this.state.error.message}.`}</span>
        }
        return this.props.children
      }
    }

    function BrokenRender (props) {
      throw new Error('Hello')
    }

    render(
      <ErrorBoundary>
        <BrokenRender />
      </ErrorBoundary>,
      scratch
    )

    expect(scratch.childNodes[0].childNodes[0].data).toBe(
      'Caught an error: Hello.'
    )
  })

  it('catches lifeCycles errors in a boundary', async () => {
    class ErrorBoundary extends Component {
      state = { error: null }
      componentDidCatch (error) {
        this.setState({ error })
      }
      render () {
        if (this.state.error) {
          return <span>{`Caught an error: ${this.state.error.message}.`}</span>
        }
        return <BrokenRender />
      }
    }

    class BrokenRender extends Component {
      componentDidMount () {
        throw new Error('Hello')
      }
      render () {
        return <span>Hello</span>
      }
    }
    let app
    render(<ErrorBoundary ref={c => (app = c)} />, scratch)

    app.forceUpdate()

    expect(scratch.firstChild.textContent).toBe('Caught an error: Hello.')
  })

  it('catches render errors in a component', () => {
    class BrokenRender extends Component {
      state = { error: null }
      componentDidCatch (error) {
        this.setState({ error })
      }
      render () {
        if (this.state.error) {
          return <span>{`Caught an error: ${this.state.error.message}.`}</span>
        }
        throw new Error('broken')
      }
    }
    let app
    render(<BrokenRender ref={c => (app = c)} />, scratch)
    app.forceUpdate()
    expect(scratch.firstChild.textContent).toBe('Caught an error: broken.')
  })
})
