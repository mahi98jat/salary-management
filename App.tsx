
import React, { useState, useEffect, useCallback } from 'react';
import { Feature, TDDStep, KataStepContent, MetricData } from './types';
import { INITIAL_KATA_DATA, MOCK_EMPLOYEES } from './constants';
import { generateKataStep, explainTDDConcept } from './services/geminiService';
import CodeBlock from './components/CodeBlock';
import ProgressBar from './components/ProgressBar';
import FeatureCard from './components/FeatureCard';
import Analytics from './components/Analytics';

const App: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<Feature>(Feature.CRUD);
  const [currentStep, setCurrentStep] = useState<TDDStep>(TDDStep.RED);
  const [kataData, setKataData] = useState(INITIAL_KATA_DATA);
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<string>('');

  const currentFeatureData = kataData.find(f => f.id === activeFeature);
  const currentStepData = currentFeatureData?.steps.find(s => s.step === currentStep);

  const handleNextStep = async () => {
    setLoading(true);
    let nextStep: TDDStep = TDDStep.RED;
    
    if (currentStep === TDDStep.RED) nextStep = TDDStep.GREEN;
    else if (currentStep === TDDStep.GREEN) nextStep = TDDStep.REFACTOR;
    else {
      // Move to next feature
      const features = Object.values(Feature);
      const currentIndex = features.indexOf(activeFeature);
      if (currentIndex < features.length - 1) {
        setActiveFeature(features[currentIndex + 1]);
        nextStep = TDDStep.RED;
      } else {
        alert("Congratulations! You've completed the Kata!");
        setLoading(false);
        return;
      }
    }

    try {
      const newStepContent = await generateKataStep(
        activeFeature,
        nextStep,
        currentStepData?.implementationCode || currentStepData?.testCode
      );

      setKataData(prev => prev.map(f => {
        if (f.id === (nextStep === TDDStep.RED && currentStep === TDDStep.REFACTOR ? activeFeature : f.id)) {
            // Logic to add or replace step
            const existingStepIndex = f.steps.findIndex(s => s.step === nextStep);
            if (existingStepIndex > -1) {
                f.steps[existingStepIndex] = newStepContent;
            } else {
                f.steps.push(newStepContent);
            }
        }
        return f;
      }));
      
      setCurrentStep(nextStep);
      const expl = await explainTDDConcept(nextStep);
      setExplanation(expl);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics based on mock data
  const countryMetrics: MetricData[] = [
    { name: 'India', min: 1200000, max: 1800000, avg: 1500000 },
    { name: 'USA', min: 90000, max: 150000, avg: 120000 },
    { name: 'UK', min: 60000, max: 60000, avg: 60000 }
  ];

  const jobMetrics: MetricData[] = [
    { name: 'Software Engineer', avg: 150000 },
    { name: 'Product Manager', avg: 150000 },
    { name: 'Designer', avg: 60000 },
    { name: 'QA Engineer', avg: 90000 }
  ];

  const getOverallProgress = () => {
    const totalSteps = Object.keys(Feature).length * 3;
    let completedSteps = 0;
    kataData.forEach(f => {
        completedSteps += f.steps.length;
    });
    return (completedSteps / totalSteps) * 100;
  };

  useEffect(() => {
    // Initial explanation
    explainTDDConcept(TDDStep.RED).then(setExplanation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              Salary Kata Master
            </h1>
          </div>
          <div className="w-64 hidden md:block">
            <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
              <span>Overall Progress</span>
              <span>{Math.round(getOverallProgress())}%</span>
            </div>
            <ProgressBar progress={getOverallProgress()} />
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col md:flex-row p-6 gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-80 space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Features</h2>
            <div className="space-y-3">
              {Object.values(Feature).map((feat) => (
                <FeatureCard 
                  key={feat}
                  feature={feat}
                  isActive={activeFeature === feat}
                  isCompleted={kataData.find(f => f.id === feat)?.steps.length === 3}
                  onClick={() => setActiveFeature(feat)}
                />
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">AI Mentor Tip</h2>
            <div className="text-sm text-slate-600 italic leading-relaxed">
              {loading ? (
                <div className="animate-pulse flex space-x-4">
                  <div className="flex-1 space-y-4 py-1">
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-200 rounded"></div>
                    <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                  </div>
                </div>
              ) : explanation}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 space-y-8">
          {/* Step Navigator */}
          <div className="bg-white rounded-3xl border border-slate-200 p-2 shadow-sm flex items-center justify-between">
             <div className="flex space-x-1 flex-1">
               {Object.values(TDDStep).map((step) => (
                 <div 
                   key={step}
                   className={`flex-1 py-3 px-4 rounded-2xl text-center font-bold text-sm transition-all ${
                     currentStep === step 
                      ? (step === TDDStep.RED ? 'bg-red-50 text-red-600 ring-1 ring-red-200' : 
                         step === TDDStep.GREEN ? 'bg-green-50 text-green-600 ring-1 ring-green-200' : 
                         'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200')
                      : 'text-slate-400'
                   }`}
                 >
                   {step}
                 </div>
               ))}
             </div>
          </div>

          {/* Current Step Details */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            <div className={`h-2 ${
                currentStep === TDDStep.RED ? 'bg-red-500' : 
                currentStep === TDDStep.GREEN ? 'bg-green-500' : 'bg-indigo-500'
            }`} />
            
            <div className="p-8">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
                    {currentStep} Phase: {activeFeature}
                  </h2>
                  <p className="text-slate-600 leading-relaxed max-w-2xl">
                    {currentStepData?.description || "Generate content to start this step."}
                  </p>
                </div>
                <button 
                  onClick={handleNextStep}
                  disabled={loading}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 active:transform active:scale-95 flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Crafting...</span>
                    </>
                  ) : (
                    <>
                      <span>{currentStep === TDDStep.REFACTOR ? 'Next Feature' : 'Next Step'}</span>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-6">
                {currentStepData?.testCode && (
                   <CodeBlock title="Vitest Suite" code={currentStepData.testCode} />
                )}
                
                {currentStepData?.implementationCode && (
                   <CodeBlock title="Implementation (TypeScript)" code={currentStepData.implementationCode} />
                )}

                {currentStepData?.curlCommand && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Failing Command</label>
                    <div className="bg-slate-900 rounded-xl p-4 flex items-center justify-between group">
                      <code className="text-indigo-400 text-sm overflow-x-auto whitespace-nowrap scrollbar-hide">
                        {currentStepData.curlCommand}
                      </code>
                      <button 
                        onClick={() => navigator.clipboard.writeText(currentStepData.curlCommand)}
                        className="ml-4 p-2 text-slate-400 hover:text-white transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {currentStepData?.commitMessage && (
                   <div className="flex items-center space-x-3 text-slate-500 bg-slate-100 p-4 rounded-xl border border-dashed border-slate-300">
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                     <span className="text-sm">Commit: <span className="font-mono text-indigo-600">{currentStepData.commitMessage}</span></span>
                   </div>
                )}
              </div>
            </div>
          </div>

          {/* Analytics Feature Preview */}
          {activeFeature === Feature.METRICS && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Analytics countryMetrics={countryMetrics} jobMetrics={jobMetrics} />
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-6 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <p>© 2024 Incubyte Craftsmanship Academy. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:next-0">
            <a href="#" className="hover:text-indigo-600 transition-colors">TDD Guide</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">SOLID Principles</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Repository Pattern</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
