import React, { useState } from 'react';
import { ResumeData } from '@/types/resume';
import { AISmartSectionAssistant } from './AISmartSectionAssistant';

interface Props {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}

export function StepSkills({ data, onChange }: Props) {
  const [newSkill, setNewSkill] = useState('');

  const handleAdd = (e: React.KeyboardEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) => {
    if ('key' in e && e.key !== 'Enter') return;
    
    const trimmed = newSkill.trim();
    if (trimmed && !data.skills.includes(trimmed)) {
      onChange({ ...data, skills: [...data.skills, trimmed] });
    }
    setNewSkill('');
  };

  const handleApplyAiData = (parsed: { skills?: string[] }) => {
    if (parsed.skills && parsed.skills.length > 0) {
      const existingSet = new Set(data.skills);
      parsed.skills.forEach(s => {
        if (s && s.trim()) existingSet.add(s.trim());
      });
      onChange({ ...data, skills: Array.from(existingSet) });
    }
  };

  const handleRemove = (skillToRemove: string) => {
    onChange({ ...data, skills: data.skills.filter(s => s !== skillToRemove) });
  };

  const inputStyle = {
    fontSize: '1rem',
    padding: '0.75rem',
    minHeight: '48px',
    boxSizing: 'border-box' as const,
    width: '100%',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'var(--bg-base)',
    color: 'var(--text-primary)',
    marginBottom: '1rem'
  };

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Skills</h2>

      <AISmartSectionAssistant
        sectionType="skills"
        sectionTitle="Skills & Technologies"
        placeholderHint="e.g. I know React, TypeScript, Python, Node.js, SQL databases, Docker, and Git, along with Agile methodologies."
        onApplyData={handleApplyAiData}
      />

      <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.9rem' }}>
        Add your technical and soft skills. Press Enter to add each skill.
      </p>

      
      <div>
        <input 
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={handleAdd}
          onBlur={handleAdd}
          style={inputStyle}
          placeholder="e.g. React, Python, Project Management..."
        />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
        {data.skills.map((skill, idx) => (
          <div key={idx} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '6px 12px', 
            background: 'var(--bg-elevated)', 
            border: '1px solid var(--border)',
            borderRadius: '16px',
            fontSize: '0.9rem'
          }}>
            <span>{skill}</span>
            <button 
              onClick={() => handleRemove(skill)} 
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 2px' }}
              title="Remove"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
