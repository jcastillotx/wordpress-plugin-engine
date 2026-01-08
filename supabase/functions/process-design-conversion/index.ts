import { serve } from "https://deno.land/std@0.177.1/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { conversionId } = await req.json();

    if (!conversionId) {
      return new Response(
        JSON.stringify({ error: 'Missing conversionId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: conversion, error: fetchError } = await supabase
      .from('design_conversions')
      .select('*')
      .eq('id', conversionId)
      .single();

    if (fetchError || !conversion) {
      return new Response(
        JSON.stringify({ error: 'Conversion not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    await supabase
      .from('design_conversions')
      .update({ status: 'analyzing' })
      .eq('id', conversionId);

    const analysis = await analyzeDesign(conversion.image_url, conversion.conversion_type);

    await supabase
      .from('design_conversions')
      .update({ 
        status: 'generating',
        analysis: analysis
      })
      .eq('id', conversionId);

    const result = await generateCode(analysis, conversion.conversion_type, conversion.prompt);

    await supabase
      .from('design_conversions')
      .update({ 
        status: 'completed',
        result: result.code,
        companion_plugin: result.companionPlugin,
        needs_companion_plugin: result.needsCompanionPlugin,
        completed_at: new Date().toISOString()
      })
      .eq('id', conversionId);

    return new Response(
      JSON.stringify({ success: true, conversionId }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing conversion:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function analyzeDesign(imageUrl: string, conversionType: string) {
  return {
    layout: {
      type: 'hero-section',
      structure: 'single-column',
      elements: [
        { type: 'heading', text: 'Welcome to Our Site', level: 1 },
        { type: 'paragraph', text: 'This is a sample description' },
        { type: 'button', text: 'Get Started', style: 'primary' }
      ]
    },
    styling: {
      colors: ['#2563eb', '#ffffff', '#1e293b'],
      typography: { heading: 'sans-serif', body: 'sans-serif' },
      spacing: 'standard'
    },
    components: [
      { name: 'hero', complexity: 'basic' },
      { name: 'button', complexity: 'basic' }
    ]
  };
}

async function generateCode(analysis: any, conversionType: string, userPrompt: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  if (conversionType === 'html') {
    return generateHTML(analysis, userPrompt);
  } else if (conversionType === 'divi') {
    return await generateDivi(analysis, userPrompt, supabase);
  } else if (conversionType === 'elementor') {
    return await generateElementor(analysis, userPrompt, supabase);
  }

  throw new Error('Invalid conversion type');
}

function generateHTML(analysis: any, userPrompt: string) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated Design</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      line-height: 1.6;
    }
    .hero {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .hero h1 {
      font-size: 3rem;
      margin-bottom: 1rem;
      font-weight: 700;
    }
    .hero p {
      font-size: 1.25rem;
      margin-bottom: 2rem;
      max-width: 600px;
    }
    .btn {
      display: inline-block;
      padding: 1rem 2rem;
      background: white;
      color: #667eea;
      text-decoration: none;
      border-radius: 0.5rem;
      font-weight: 600;
      transition: transform 0.2s;
    }
    .btn:hover {
      transform: translateY(-2px);
    }
  </style>
</head>
<body>
  <section class="hero">
    <h1>${analysis.layout.elements[0]?.text || 'Welcome'}</h1>
    <p>${analysis.layout.elements[1]?.text || 'Description'}</p>
    <a href="#" class="btn">${analysis.layout.elements[2]?.text || 'Get Started'}</a>
  </section>
</body>
</html>`;

  return {
    code: { html, css: '', javascript: '' },
    companionPlugin: null,
    needsCompanionPlugin: false
  };
}

async function generateDivi(analysis: any, userPrompt: string, supabase: any) {
  const { data: modules } = await supabase
    .from('divi_modules')
    .select('*')
    .eq('is_baseline', true);

  const needsCustomModule = false;

  const diviLayout = {
    sections: [
      {
        type: 'et_pb_section',
        background: 'gradient',
        columns: [
          {
            type: 'et_pb_column',
            modules: [
              { type: 'et_pb_text', content: `<h1>${analysis.layout.elements[0]?.text}</h1>` },
              { type: 'et_pb_text', content: `<p>${analysis.layout.elements[1]?.text}</p>` },
              { type: 'et_pb_button', text: analysis.layout.elements[2]?.text, url: '#' }
            ]
          }
        ]
      }
    ]
  };

  const companionPlugin = needsCustomModule ? generateDiviCompanionPlugin(analysis) : null;

  return {
    code: diviLayout,
    companionPlugin,
    needsCompanionPlugin: needsCustomModule
  };
}

async function generateElementor(analysis: any, userPrompt: string, supabase: any) {
  const { data: widgets } = await supabase
    .from('elementor_widgets')
    .select('*')
    .eq('is_baseline', true);

  const needsCustomWidget = false;

  const elementorLayout = {
    sections: [
      {
        type: 'section',
        settings: {
          background_background: 'gradient',
          background_color: '#667eea',
          background_color_b: '#764ba2'
        },
        columns: [
          {
            type: 'column',
            widgets: [
              { 
                type: 'heading',
                settings: { 
                  title: analysis.layout.elements[0]?.text,
                  size: 'xxl',
                  align: 'center'
                }
              },
              { 
                type: 'text-editor',
                settings: { 
                  editor: analysis.layout.elements[1]?.text,
                  align: 'center'
                }
              },
              { 
                type: 'button',
                settings: { 
                  text: analysis.layout.elements[2]?.text,
                  link: { url: '#' },
                  align: 'center'
                }
              }
            ]
          }
        ]
      }
    ]
  };

  const companionPlugin = needsCustomWidget ? generateElementorCompanionPlugin(analysis) : null;

  return {
    code: elementorLayout,
    companionPlugin,
    needsCompanionPlugin: needsCustomWidget
  };
}

function generateDiviCompanionPlugin(analysis: any) {
  return {
    name: 'Custom Divi Module',
    description: 'Auto-generated custom Divi module for your design',
    files: {
      'custom-module.php': '<?php\n// Custom Divi Module\nclass Custom_Divi_Module extends ET_Builder_Module {}'
    }
  };
}

function generateElementorCompanionPlugin(analysis: any) {
  return {
    name: 'Custom Elementor Widget',
    description: 'Auto-generated custom Elementor widget for your design',
    files: {
      'custom-widget.php': '<?php\n// Custom Elementor Widget\nclass Custom_Elementor_Widget extends \\Elementor\\Widget_Base {}'
    }
  };
}