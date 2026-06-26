/**
 * Tests for JourneyTimelineSidebar component.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import JourneyTimelineSidebar from '@/components/Journey/JourneyTimelineSidebar';
import type { ElectionStep } from '@/types';

jest.mock('@/components/ui/TranslatedText', () => ({
  __esModule: true,
  default: ({ text }: { text: string }) => <span>{text}</span>,
}));

jest.mock('@/components/Journey/Timeline', () => ({
  __esModule: true,
  default: () => <div data-testid="timeline">Timeline</div>,
}));

const mockSteps: ElectionStep[] = [
  { id: '1', order: 1, title: 'Step 1', description: 'Desc 1', detailedExplanation: '', simpleExplanation: '', timeline: '', requirements: [], tips: [], status: 'completed' },
  { id: '2', order: 2, title: 'Step 2', description: 'Desc 2', detailedExplanation: '', simpleExplanation: '', timeline: '', requirements: [], tips: [], status: 'completed' },
  { id: '3', order: 3, title: 'Step 3', description: 'Desc 3', detailedExplanation: '', simpleExplanation: '', timeline: '', requirements: [], tips: [], status: 'current' },
  { id: '4', order: 4, title: 'Step 4', description: 'Desc 4', detailedExplanation: '', simpleExplanation: '', timeline: '', requirements: [], tips: [], status: 'locked' },
  { id: '5', order: 5, title: 'Step 5', description: 'Desc 5', detailedExplanation: '', simpleExplanation: '', timeline: '', requirements: [], tips: [], status: 'locked' },
];

describe('JourneyTimelineSidebar', () => {
  const onStepClick = jest.fn();
  const onTakeQuiz = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Timeline component', () => {
    render(
      <JourneyTimelineSidebar
        steps={mockSteps}
        currentStepIndex={2}
        completedSteps={[]}
        isAllStepsDone={false}
        onStepClick={onStepClick}
        onTakeQuiz={onTakeQuiz}
      />
    );
    expect(screen.getByTestId('timeline')).toBeInTheDocument();
  });

  it('does NOT render "Take Quiz Early" button when completed steps are < 50% (e.g. 1 out of 5)', () => {
    render(
      <JourneyTimelineSidebar
        steps={mockSteps}
        currentStepIndex={2}
        completedSteps={['1']}
        isAllStepsDone={false}
        onStepClick={onStepClick}
        onTakeQuiz={onTakeQuiz}
      />
    );
    expect(screen.queryByText('Take Quiz Early')).not.toBeInTheDocument();
    expect(screen.queryByText('Feel ready?')).not.toBeInTheDocument();
  });

  it('renders "Take Quiz Early" button when completed steps are >= 50% (e.g. 3 out of 5) and calls onTakeQuiz on click', () => {
    render(
      <JourneyTimelineSidebar
        steps={mockSteps}
        currentStepIndex={3}
        completedSteps={['1', '2', '3']}
        isAllStepsDone={false}
        onStepClick={onStepClick}
        onTakeQuiz={onTakeQuiz}
      />
    );
    
    expect(screen.getByText('Feel ready?')).toBeInTheDocument();
    const button = screen.getByText('Take Quiz Early');
    expect(button).toBeInTheDocument();
    
    fireEvent.click(button);
    expect(onTakeQuiz).toHaveBeenCalledTimes(1);
  });

  it('does NOT render "Take Quiz Early" button when all steps are completed (isAllStepsDone is true)', () => {
    render(
      <JourneyTimelineSidebar
        steps={mockSteps}
        currentStepIndex={4}
        completedSteps={['1', '2', '3', '4', '5']}
        isAllStepsDone={true}
        onStepClick={onStepClick}
        onTakeQuiz={onTakeQuiz}
      />
    );
    
    expect(screen.queryByText('Take Quiz Early')).not.toBeInTheDocument();
    // But it should render the Learning Completed! trophy block
    expect(screen.getByText('Learning Completed!')).toBeInTheDocument();
  });
});
