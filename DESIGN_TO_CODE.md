# Design-to-Code Conversion System

## Overview

The Design-to-Code system transforms design images (screenshots, mockups, wireframes) into production-ready code or page builder layouts. It supports three output formats:

1. **HTML/CSS** - Clean, semantic HTML with modern CSS
2. **Divi Layouts** - Divi Builder page layouts using baseline modules
3. **Elementor Layouts** - Elementor widget configurations

## Key Features

### Intelligent Analysis
- AI-powered design analysis
- Component detection and identification
- Layout structure recognition
- Color and typography extraction
- Responsive design considerations

### Baseline Module Mapping
The system includes comprehensive databases of baseline modules:

**Divi Modules (16 baseline modules)**
- Text, Image, Button, Blurb
- Section, Row, Column
- Video, Gallery, Slider
- Accordion, Tabs, Toggle
- Contact Form, Divider, Code

**Elementor Widgets (18 baseline widgets)**
- Heading, Text Editor, Image, Button
- Divider, Spacer, Icon, Icon Box
- Image Box, Video, Section, Column
- Tabs, Accordion, Toggle
- Gallery, Form, HTML

### Companion Plugin Generation

When a design requires functionality beyond baseline modules, the system automatically:
1. Detects the missing capability
2. Generates a custom companion plugin
3. Creates the custom module/widget code
4. Packages it for easy installation

**Example scenarios requiring companion plugins:**
- Custom animations not in baseline
- Advanced hover effects
- Complex interactive elements
- Unique layout patterns
- Custom data integrations

## How It Works

### 1. Upload & Configure
Users upload a design image and specify:
- **Conversion Name** - Descriptive title for the project
- **Output Type** - HTML, Divi, or Elementor
- **Additional Instructions** - Optional guidance for the AI

### 2. AI Processing
The edge function `process-design-conversion` handles:

**Analysis Phase:**
- Identifies layout structure (hero, grid, columns, etc.)
- Detects UI components (buttons, forms, navigation, etc.)
- Extracts styling (colors, fonts, spacing)
- Maps components to baseline modules

**Generation Phase:**
- Creates appropriate code/configuration
- Determines if companion plugin is needed
- Generates companion plugin if necessary
- Structures output for easy implementation

### 3. Results & Download
Users receive:
- **Preview** - Visual preview of the generated design
- **Code** - Copy-paste ready code or JSON configuration
- **Companion Plugin** - If needed, downloadable plugin package

## Database Schema

### design_conversions
Tracks all conversion requests:
- User information and conversion name
- Image URL and conversion type
- Processing status (pending → analyzing → generating → completed/failed)
- Generated results and analysis
- Companion plugin data if needed

### divi_modules & elementor_widgets
Reference tables containing baseline capabilities:
- Module/widget name and slug
- Category (basic, layout, content, etc.)
- Capabilities JSON (what it can do)
- Whether it's baseline or custom

## Usage Examples

### Example 1: Simple HTML Conversion
```
Input: Hero section with heading, text, and button
Output:
- Clean HTML5 structure
- Modern CSS with flexbox/grid
- Responsive design patterns
- No companion plugin needed
```

### Example 2: Divi Layout
```
Input: Multi-column feature section
Output:
- Divi Section with 3 columns
- Blurb modules for icons + text
- Button modules for CTAs
- JSON configuration for import
- No companion plugin (uses baseline modules)
```

### Example 3: Complex Elementor with Custom Widget
```
Input: Advanced timeline component
Output:
- Elementor section structure
- Standard widget configurations where possible
- Custom timeline widget in companion plugin
- Installation instructions
```

## API Integration

### Edge Function Endpoint
```
POST /functions/v1/process-design-conversion
Body: { conversionId: "uuid" }
```

The function:
1. Fetches conversion from database
2. Updates status to 'analyzing'
3. Analyzes the image
4. Updates status to 'generating'
5. Generates code/layout
6. Checks if companion plugin needed
7. Updates status to 'completed'
8. Returns success response

### Frontend Integration
```typescript
// Start conversion
const { data } = await supabase
  .from('design_conversions')
  .insert({
    user_id: user.id,
    name: 'Homepage Hero',
    image_url: uploadedImageUrl,
    conversion_type: 'divi',
    prompt: 'Make it mobile-first'
  });

// Process conversion
await fetch(`${SUPABASE_URL}/functions/v1/process-design-conversion`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${ANON_KEY}` },
  body: JSON.stringify({ conversionId: data.id })
});
```

## User Interface

### Design to Code Page
- Drag-and-drop image uploader
- Conversion type selector (HTML/Divi/Elementor)
- Optional instructions textarea
- Visual feedback during upload
- Clear submission flow

### My Conversions Page
- Grid view of all conversions
- Status badges (pending, analyzing, generating, completed, failed)
- Preview thumbnails
- Quick action buttons
- Filter by status or type

### Conversion Viewer
- Original design preview
- Generated code viewer with syntax highlighting
- Copy-to-clipboard functionality
- Download options (HTML, JSON, plugin)
- Tab navigation (Preview / Code / Plugin)
- Companion plugin details if applicable

## Best Practices

### For Users
1. **Use High-Quality Images** - Clear screenshots produce better results
2. **Be Specific** - Add instructions for special requirements
3. **Start Simple** - Test with basic layouts before complex designs
4. **Check Baseline** - Know what baseline modules can do
5. **Install Companion** - Always install companion plugins when needed

### For Developers
1. **Image Storage** - Configure Supabase storage bucket `design-images`
2. **AI Vision** - Integrate actual vision API (OpenAI, Google Vision, etc.)
3. **Module Database** - Keep baseline modules updated
4. **Error Handling** - Implement retry logic for failed conversions
5. **Rate Limiting** - Add conversion limits per subscription tier

## Future Enhancements

### Planned Features
- [ ] Real-time collaboration
- [ ] Version history for conversions
- [ ] A/B testing different outputs
- [ ] Direct WordPress integration
- [ ] Figma/Sketch plugin import
- [ ] Mobile app preview
- [ ] Custom module library
- [ ] Team sharing and templates

### AI Improvements
- [ ] Advanced component recognition
- [ ] Better accessibility compliance
- [ ] SEO optimization suggestions
- [ ] Performance optimization
- [ ] Dark mode detection
- [ ] Animation timeline generation

## Troubleshooting

### Conversion Stuck in "Pending"
- Click "Start Processing" button
- Check edge function logs
- Verify database permissions

### No Preview Available
- Only HTML conversions show live preview
- Divi/Elementor need to be imported into builders
- Check if iframe is blocked

### Companion Plugin Not Generating
- Design may use only baseline modules
- Check `needs_companion_plugin` flag
- Review analysis data for missing capabilities

### Failed Conversions
- Check error_message field
- Verify image URL is accessible
- Ensure image format is supported
- Review edge function logs

## Security Considerations

- Images stored in secure Supabase storage
- RLS policies restrict access to user's own conversions
- Edge function validates user authentication
- Companion plugins sandboxed for review
- No executable code in database
- Input sanitization on all fields

## Subscription Limits

Consider implementing tiered limits:

**Free Tier**
- 5 conversions per month
- HTML output only
- Basic companion plugins

**Pro Tier**
- 50 conversions per month
- All output types
- Advanced companion plugins
- Priority processing

**Enterprise Tier**
- Unlimited conversions
- Custom AI training
- White-label companion plugins
- Dedicated support
