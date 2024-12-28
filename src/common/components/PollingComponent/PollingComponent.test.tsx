import { render, screen } from '../../utils/test-utils'
import { PollingComponent } from './PollingComponent'

describe('PollingComponent', async() => {
  it('should render the PollingComponent:isDebugEnabled', () => {
    render(
      <PollingComponent<number>
        key={0}
        resValidator={(_data) => false}
        // onEachResponse={}
        onSuccess={(_ps) => {
          // NOTE: Never, cuz resValidator() => false
        }}
        promise={() => Promise.resolve({ ok: true, targetResponse: 1 })}
        delay={60 * 1000}
        isDebugEnabled
      />,
    )
    // expect(screen.getByText('Email Address')).toBeInTheDocument()
    // expect(screen.getByRole('textbox', { name: /email address/i })).toBeInTheDocument()
    expect(screen.getByText('Loader...')).toBeInTheDocument()
  })
})
