import React from 'react';
import { ResumeData } from '@/types/resume';
import { AIImproveButton } from './AIImproveButton';
import { AISmartSectionAssistant } from './AISmartSectionAssistant';

interface Props {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}

export function StepSummary({ data, onChange }: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ ...data, summary: e.target.value });
  };

  const handleImproveAccept = (newText: string) => {
    onChange({ ...data, summary: newText });
  };

  const handleApplyAiData = (parsed: { summary?: string }) => {
    if (parsed.summary) {
      onChange({ ...data, summary: parsed.summary });
    }
  };

  const textareaStyle = {
    fontSize: '1rem',
    padding: '0.75rem',
    minHeight: '150px',
    boxSizing: 'border-box' as const,
    width: '100%',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'var(--bg-base)',
    color: 'var(--text-primary)',
    marginBottom: '1rem',
    resize: 'vertical' as const
  };

  const labelStyle = {
    display: 'block',
    fontWeight: 'bold',
    fontSize: '0.9rem'
  };

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Professional Summary</h2>
      
      <AISmartSectionAssistant
        sectionType="summary"
        sectionTitle="Professional Summary"
        placeholderHint="e.g. I am a passionate frontend developer who loves building fast web apps with React. I have 2 years of freelance experience and want a full-time role."
        onApplyData={handleApplyAiData}
      />

      
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <label htmlFor="summary" style={labelStyle}>Summary / Career Objective</label>
          <AIImproveButton 
            sectionType="summary" 
            currentText={data.summary || ''} 
            onAccept={handleImproveAccept} 
          />
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
          Write a brief summary of your background, key skills, and career goals.
        </p>
        <textarea 
          id="summary" 
          name="summary" 
          value={data.summary} 
          onChange={handleChange} 
          style={textareaStyle} 
          placeholder="Execution-focused Software Engineer with experience in..."
        />
      </div>
    </div>
  );
}
