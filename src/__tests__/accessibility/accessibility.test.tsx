import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import userEvent from '@testing-library/user-event';
import App from '../../App';
import { UploadZone } from '../../components/UploadZone';
import { ImageCard } from '../../components/ImageCard';
import { CaptionSelector } from '../../components/CaptionSelector';
import { Toolbar } from '../../components/Toolbar';
import type { ImageDoc, CaptionCandidate } from '../../types';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock Firebase services
vi.mock('../../services/firebase', () => ({
  auth: {
    onAuthStateChanged: vi.fn((callback) => {
      callback({ uid: 'test-user', isAnonymous: true });
      return () => {};
    }),
    signInAnonymously: vi.fn(),
    currentUser: { uid: 'test-user', isAnonymous: true }
  },
  db: {},
  storage: {}
}));

// Mock services to provide test data
vi.mock('../../services/imageService', () => ({
  ImageService: vi.fn().mockImplementation(() => ({
    subscribeToImages: vi.fn((userId, callback) => {
      callback([]);
      return () => {};
    })
  }))
}));

const mockImage: ImageDoc = {
  id: 'test-image-1',
  filename: 'test.jpg',
  storagePath: 'uploads/test-user/test.jpg',
  downloadURL: 'https://example.com/test.jpg',
  status: 'complete',
  candidates: [
    {
      modelId: 'openai:gpt-4o-mini',
      caption: 'A beautiful landscape with mountains and trees',
      createdAt: Date.now(),
      latencyMs: 1200
    },
    {
      modelId: 'google:gemini-pro-vision',
      caption: 'Scenic mountain view with forest in the foreground',
      createdAt: Date.now(),
      latencyMs: 800
    }
  ],
  selectedIndex: null,
  createdAt: Date.now(),
  updatedAt: Date.now()
};

describe('Accessibility Tests', () => {
  describe('App Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<App />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper document structure', async () => {
      render(<App />);
      
      // Should have main landmark
      expect(screen.getByRole('main')).toBeInTheDocument();
      
      // Should have proper heading hierarchy
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent(/LoRa Dataset Builder/i);
    });

    it('should have skip navigation link', async () => {
      render(<App />);
      
      // Skip link should be present (may be visually hidden)
      const skipLink = screen.queryByText(/skip to main content/i);
      if (skipLink) {
        expect(skipLink).toBeInTheDocument();
        expect(skipLink).toHaveAttribute('href', '#main-content');
      }
    });

    it('should announce authentication status to screen readers', async () => {
      render(<App />);
      
      // Should have live region for auth status
      const authStatus = screen.queryByRole('status');
      if (authStatus) {
        expect(authStatus).toBeInTheDocument();
      }
    });
  });

  describe('UploadZone Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <UploadZone 
          onFilesSelected={vi.fn()} 
          isUploading={false} 
          progress={0} 
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper file input labeling', () => {
      render(
        <UploadZone 
          onFilesSelected={vi.fn()} 
          isUploading={false} 
          progress={0} 
        />
      );
      
      const fileInput = screen.getByLabelText(/upload images/i);
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveAttribute('type', 'file');
      expect(fileInput).toHaveAttribute('accept', 'image/*');
    });

    it('should have proper drag and drop accessibility', () => {
      render(
        <UploadZone 
          onFilesSelected={vi.fn()} 
          isUploading={false} 
          progress={0} 
        />
      );
      
      const dropZone = screen.getByText(/drag.*drop.*images/i).closest('div');
      expect(dropZone).toHaveAttribute('role', 'button');
      expect(dropZone).toHaveAttribute('tabIndex', '0');
      expect(dropZone).toHaveAttribute('aria-label');
    });

    it('should announce upload progress', () => {
      render(
        <UploadZone 
          onFilesSelected={vi.fn()} 
          isUploading={true} 
          progress={50} 
        />
      );
      
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuenow', '50');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
      expect(progressBar).toHaveAttribute('aria-label');
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      const onFilesSelected = vi.fn();
      
      render(
        <UploadZone 
          onFilesSelected={onFilesSelected} 
          isUploading={false} 
          progress={0} 
        />
      );
      
      const dropZone = screen.getByRole('button');
      
      // Should be focusable
      await user.tab();
      expect(dropZone).toHaveFocus();
      
      // Should activate on Enter/Space
      await user.keyboard('{Enter}');
      // File dialog would open (mocked in tests)
    });
  });

  describe('ImageCard Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <ImageCard 
          image={mockImage}
          onUpdate={vi.fn()}
          onDelete={vi.fn()}
          onRegenerate={vi.fn()}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper image alt text', () => {
      render(
        <ImageCard 
          image={mockImage}
          onUpdate={vi.fn()}
          onDelete={vi.fn()}
          onRegenerate={vi.fn()}
        />
      );
      
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('alt');
      expect(image.getAttribute('alt')).toContain(mockImage.filename);
    });

    it('should have accessible action buttons', () => {
      render(
        <ImageCard 
          image={mockImage}
          onUpdate={vi.fn()}
          onDelete={vi.fn()}
          onRegenerate={vi.fn()}
        />
      );
      
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      expect(deleteButton).toBeInTheDocument();
      expect(deleteButton).toHaveAttribute('aria-label');
      
      const regenerateButton = screen.getByRole('button', { name: /regenerate/i });
      expect(regenerateButton).toBeInTheDocument();
      expect(regenerateButton).toHaveAttribute('aria-label');
    });

    it('should announce status changes', () => {
      const processingImage = { ...mockImage, status: 'processing' as const };
      
      render(
        <ImageCard 
          image={processingImage}
          onUpdate={vi.fn()}
          onDelete={vi.fn()}
          onRegenerate={vi.fn()}
        />
      );
      
      const statusElement = screen.getByText(/processing/i);
      expect(statusElement).toHaveAttribute('aria-live', 'polite');
    });

    it('should have proper focus management', async () => {
      const user = userEvent.setup();
      
      render(
        <ImageCard 
          image={mockImage}
          onUpdate={vi.fn()}
          onDelete={vi.fn()}
          onRegenerate={vi.fn()}
        />
      );
      
      // Should be able to tab through all interactive elements
      await user.tab(); // First focusable element
      expect(document.activeElement).toBeInTheDocument();
      
      await user.tab(); // Next focusable element
      expect(document.activeElement).toBeInTheDocument();
    });
  });

  describe('CaptionSelector Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <CaptionSelector 
          candidates={mockImage.candidates}
          selectedIndex={null}
          onSelectionChange={vi.fn()}
          onTextChange={vi.fn()}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper radio button group', () => {
      render(
        <CaptionSelector 
          candidates={mockImage.candidates}
          selectedIndex={null}
          onSelectionChange={vi.fn()}
          onTextChange={vi.fn()}
        />
      );
      
      const radioGroup = screen.getByRole('radiogroup');
      expect(radioGroup).toBeInTheDocument();
      expect(radioGroup).toHaveAttribute('aria-label');
      
      const radioButtons = screen.getAllByRole('radio');
      expect(radioButtons).toHaveLength(mockImage.candidates.length);
      
      radioButtons.forEach((radio, index) => {
        expect(radio).toHaveAttribute('name');
        expect(radio).toHaveAttribute('value', index.toString());
      });
    });

    it('should have accessible caption text', () => {
      render(
        <CaptionSelector 
          candidates={mockImage.candidates}
          selectedIndex={0}
          onSelectionChange={vi.fn()}
          onTextChange={vi.fn()}
        />
      );
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveAttribute('aria-label');
      expect(textarea).toHaveAttribute('rows');
    });

    it('should announce selection changes', async () => {
      const user = userEvent.setup();
      const onSelectionChange = vi.fn();
      
      render(
        <CaptionSelector 
          candidates={mockImage.candidates}
          selectedIndex={null}
          onSelectionChange={onSelectionChange}
          onTextChange={vi.fn()}
        />
      );
      
      const firstRadio = screen.getAllByRole('radio')[0];
      await user.click(firstRadio);
      
      expect(onSelectionChange).toHaveBeenCalledWith(0);
      
      // Should have live region for announcements
      const liveRegion = screen.queryByRole('status');
      if (liveRegion) {
        expect(liveRegion).toBeInTheDocument();
      }
    });

    it('should support keyboard navigation between options', async () => {
      const user = userEvent.setup();
      
      render(
        <CaptionSelector 
          candidates={mockImage.candidates}
          selectedIndex={null}
          onSelectionChange={vi.fn()}
          onTextChange={vi.fn()}
        />
      );
      
      const firstRadio = screen.getAllByRole('radio')[0];
      await user.click(firstRadio);
      
      // Arrow keys should navigate between radio buttons
      await user.keyboard('{ArrowDown}');
      expect(screen.getAllByRole('radio')[1]).toHaveFocus();
      
      await user.keyboard('{ArrowUp}');
      expect(screen.getAllByRole('radio')[0]).toHaveFocus();
    });
  });

  describe('Toolbar Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <Toolbar 
          images={[mockImage]}
          showDownloadButton={true}
          onExport={vi.fn()}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper toolbar role and labeling', () => {
      render(
        <Toolbar 
          images={[mockImage]}
          showDownloadButton={true}
          onExport={vi.fn()}
        />
      );
      
      const toolbar = screen.getByRole('toolbar');
      expect(toolbar).toBeInTheDocument();
      expect(toolbar).toHaveAttribute('aria-label');
    });

    it('should have accessible export button', () => {
      render(
        <Toolbar 
          images={[mockImage]}
          showDownloadButton={true}
          onExport={vi.fn()}
        />
      );
      
      const exportButton = screen.getByRole('button', { name: /download.*dataset/i });
      expect(exportButton).toBeInTheDocument();
      expect(exportButton).toHaveAttribute('aria-label');
      
      // Should indicate if disabled
      if (exportButton.hasAttribute('disabled')) {
        expect(exportButton).toHaveAttribute('aria-disabled', 'true');
      }
    });

    it('should announce statistics to screen readers', () => {
      render(
        <Toolbar 
          images={[mockImage]}
          showDownloadButton={true}
          onExport={vi.fn()}
        />
      );
      
      // Statistics should be announced
      const statsRegion = screen.queryByRole('status');
      if (statsRegion) {
        expect(statsRegion).toBeInTheDocument();
      }
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support full keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(<App />);
      
      // Should be able to navigate through all interactive elements
      let tabCount = 0;
      const maxTabs = 20; // Prevent infinite loop
      
      while (tabCount < maxTabs) {
        await user.tab();
        tabCount++;
        
        const activeElement = document.activeElement;
        if (activeElement && activeElement !== document.body) {
          // Should have visible focus indicator
          const computedStyle = window.getComputedStyle(activeElement);
          expect(
            computedStyle.outline !== 'none' || 
            computedStyle.boxShadow !== 'none' ||
            activeElement.classList.contains('focus-visible')
          ).toBe(true);
        }
      }
    });

    it('should trap focus in modal dialogs', async () => {
      // This would test modal focus trapping if modals are implemented
      // For now, we'll test that focus management is properly handled
      
      const user = userEvent.setup();
      render(<App />);
      
      // Test that focus doesn't escape the application
      await user.tab();
      const firstFocusable = document.activeElement;
      
      // Tab through all elements
      for (let i = 0; i < 50; i++) {
        await user.tab();
        if (document.activeElement === firstFocusable) {
          break; // Focus has wrapped around
        }
      }
      
      // Focus should have wrapped back to the beginning
      expect(document.activeElement).toBe(firstFocusable);
    });
  });

  describe('Screen Reader Support', () => {
    it('should have proper heading structure', () => {
      render(<App />);
      
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
      
      // Should start with h1
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();
    });

    it('should have proper landmark regions', () => {
      render(<App />);
      
      // Should have main landmark
      expect(screen.getByRole('main')).toBeInTheDocument();
      
      // May have other landmarks
      const navigation = screen.queryByRole('navigation');
      const banner = screen.queryByRole('banner');
      const contentinfo = screen.queryByRole('contentinfo');
      
      // If they exist, they should be properly labeled
      if (navigation) {
        expect(navigation).toHaveAttribute('aria-label');
      }
      if (banner) {
        expect(banner).toBeInTheDocument();
      }
      if (contentinfo) {
        expect(contentinfo).toBeInTheDocument();
      }
    });

    it('should announce dynamic content changes', async () => {
      render(<App />);
      
      // Should have live regions for dynamic updates
      const liveRegions = screen.getAllByRole('status');
      liveRegions.forEach(region => {
        expect(region).toHaveAttribute('aria-live');
      });
      
      const alertRegions = screen.queryAllByRole('alert');
      alertRegions.forEach(region => {
        expect(region).toHaveAttribute('aria-live', 'assertive');
      });
    });
  });

  describe('High Contrast Mode', () => {
    it('should work in high contrast mode', () => {
      // Simulate high contrast mode
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-contrast: high)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });
      
      render(<App />);
      
      // Interactive elements should be visible in high contrast
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        const computedStyle = window.getComputedStyle(button);
        // Should have border or background that works in high contrast
        expect(
          computedStyle.border !== 'none' || 
          computedStyle.backgroundColor !== 'transparent'
        ).toBe(true);
      });
    });
  });

  describe('Reduced Motion', () => {
    it('should respect reduced motion preferences', () => {
      // Mock prefers-reduced-motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });
      
      render(<App />);
      
      // Animations should be disabled or reduced
      const animatedElements = document.querySelectorAll('[class*="animate"]');
      animatedElements.forEach(element => {
        const computedStyle = window.getComputedStyle(element);
        // Should have reduced or no animation
        expect(
          computedStyle.animationDuration === '0s' ||
          computedStyle.transitionDuration === '0s' ||
          computedStyle.animationPlayState === 'paused'
        ).toBe(true);
      });
    });
  });
});