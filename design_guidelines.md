# FreightClassPro Design Guidelines

## Design System (Per User Specifications)

**Theme**: Industrial Logistics

**Color Palette**:
- Background: #0f172a (Dark Slate)
- Panel: #1e293b
- Border: #334155
- Accent: #f59e0b (Safety Orange)
- Text: #f1f5f9
- Muted Text: #94a3b8

**Typography**:
- UI Elements: 'Roboto' (sans-serif)
- Numbers/Data: 'Roboto Mono' (monospace)

## Layout Structure

**Desktop Layout**:
- Two-column main layout: Left (Calculator), Right (Reference Table)
- Max-width container for readability
- Generous spacing between calculator and reference table

**Mobile Layout** (Critical for warehouse use):
- Single column stack: Calculator → Reference Table
- Full-width components with appropriate padding
- Touch-friendly tap targets (minimum 44px × 44px)
- Large input fields optimized for warehouse visibility
- Adaptive spacing that scales down appropriately

## Component Specifications

**Calculator Card**:
- High contrast panel (#1e293b on #0f172a background)
- Large, clearly labeled input fields
- Input groups for Length/Width/Height dimensions
- Weight input
- Unit selector (Inches/Lbs vs CM/Kg) - prominent toggle
- Palletized toggle - clear checkbox or switch
- **Reset Button**: Prominent placement, easily accessible, Safety Orange accent on hover
- Border styling using #334155

**Result Box**:
- Prominent display area below inputs
- Large typography for Density value (2 decimal precision)
- Bold display of calculated Freight Class
- High contrast with accent color highlights

**Reference Table**:
- Styled HTML table with header row
- Columns: Density Range, Freight Class
- Alternating row colors for readability
- Border styling consistent with theme
- Responsive: horizontal scroll on small devices if needed

**Header**:
- Logo/Brand: "FreightClassPro"
- Subtitle: "LTL Density Calculator"
- Centered alignment
- Safety Orange accent for branding

**Footer**:
- Links to About, Contact, Privacy pages
- Copyright: "2025 Ellie Petal Media"
- Safety Orange links
- Adequate padding/spacing

## Mobile Optimization

**Input Fields**:
- Large text size (16px minimum to prevent zoom on iOS)
- Adequate padding (12-16px)
- Type="number" with appropriate input modes
- Clear focus states with Safety Orange borders

**Buttons/Controls**:
- Minimum 44px height for touch targets
- Adequate spacing between interactive elements
- Unit toggle: Easy thumb-friendly switches
- Reset button: Full-width or prominent on mobile

**Spacing**:
- Desktop: 2-4rem between major sections
- Mobile: 1-2rem between sections
- Maintain breathing room without excess scrolling

## Interactive Elements

**Calculate Behavior**:
- Real-time calculation on input change
- Immediate DOM updates for results
- LocalStorage save on calculation

**Reset Functionality**:
- Clears all input fields
- Resets results display
- Retains unit preference in localStorage
- Visual feedback on click

**Unit Switching**:
- Smooth toggle between Imperial/Metric
- Preserves preference in localStorage
- Clear visual indicator of active unit

## Content Sections

**SEO Article** (Below calculator):
- Max-width 800px, centered
- Headings in #f1f5f9
- Body text in #94a3b8
- 4rem top margin for separation
- Three sections as specified in requirements

**Disclaimer**:
- Small text below calculator
- Muted color (#94a3b8)
- Clear attribution to NMFTA/CCSB

## Images

**No Hero Image**: This is a utility calculator tool focused on immediate functionality. The header contains only logo/branding text.

## Accessibility

- Proper label/input associations
- ARIA labels where appropriate
- Keyboard navigation support
- High contrast ratios (WCAG AA compliant)
- Focus indicators on all interactive elements