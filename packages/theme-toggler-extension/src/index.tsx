import { Switch } from '@jupyter/react-components';

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ILayoutRestorer,
} from '@jupyterlab/application';

import { IThemeManager, IToolbarWidgetRegistry, showDialog } from '@jupyterlab/apputils';

import { ReactWidget } from '@jupyterlab/ui-components';

import { useState, useEffect } from 'react';

import * as React from 'react';

import '../style/index.css';

import { INotebookTracker, NotebookActions } from '@jupyterlab/notebook';
import { Widget } from '@lumino/widgets';
import { Dialog } from '@jupyterlab/apputils';

const themeTogglerPluginId = 'jupyterlab-theme-toggler:plugin';

interface IThemeSwitchProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  themeManager: IThemeManager;
}

const ThemeSwitch = (props: IThemeSwitchProps) => {
  const { themeManager, ...others } = props;

  const [dark, setDark] = useState(false);

  const updateChecked = () => {
    const isDark = !themeManager.isLight(themeManager.theme);
    setDark(!!isDark);
  };

  useEffect(() => {
    let timeout = 0;
    if (!themeManager.theme) {
      // TODO: investigate why the themeManager is undefined
      timeout = setTimeout(() => {
        updateChecked();
      }, 500);
    } else {
      updateChecked();
    }
    themeManager.themeChanged.connect(updateChecked);
    return () => {
      clearTimeout(timeout);
      themeManager.themeChanged.disconnect(updateChecked);
    };
  });

  return <Switch {...others} aria-checked={dark} />;
};

const EnergyMixBar = () => {
  const [isDark, setIsDark] = useState(false);
  const [energyMix, setEnergyMix] = useState({
    solar: 40,
    wind: 30,
    battery: 25,
    grid: 5
  });

  useEffect(() => {
    // Theme management
    const themeManager = (window as any).jupyterlab?.themeManager;
    
    const updateTheme = () => {
      setIsDark(!themeManager?.isLight(themeManager?.theme));
    };

    if (themeManager) {
      updateTheme();
      themeManager.themeChanged.connect(updateTheme);
      return () => themeManager.themeChanged.disconnect(updateTheme);
    }
  }, []);

  useEffect(() => {
    // Energy mix animation
    const updateValues = () => {
      setEnergyMix(prev => {
        // Generate random fluctuations between -2.5% and +2.5%
        const fluctuate = () => (Math.random() - 0.5) * 5;
        
        // Calculate new values with fluctuations
        let newSolar = Math.max(35, Math.min(45, prev.solar + fluctuate()));
        let newWind = Math.max(25, Math.min(35, prev.wind + fluctuate()));
        let newBattery = Math.max(20, Math.min(30, prev.battery + fluctuate()));
        let newGrid = Math.max(2, Math.min(5, prev.grid + fluctuate()));
        
        // Normalize to ensure total is 100%
        const total = newSolar + newWind + newBattery + newGrid;
        const scale = 100 / total;
        
        return {
          solar: Math.round(newSolar * scale * 10) / 10,
          wind: Math.round(newWind * scale * 10) / 10,
          battery: Math.round(newBattery * scale * 10) / 10,
          grid: Math.round(newGrid * scale * 10) / 10
        };
      });
    };

    const interval = setInterval(updateValues, 2000);
    return () => clearInterval(interval);
  }, []);

  const colors = {
    solar: isDark ? '#FFD700' : '#FFB84D',
    wind: isDark ? '#87CEFA' : '#5B9FFF',
    battery: isDark ? '#DA70D6' : '#B57EDC',
    grid: isDark ? '#FF4444' : '#FF6B6B'
  };

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center',
      marginLeft: '20px',
    }}>
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        height: '20px',
        width: '200px',
        border: '1px solid var(--jp-border-color1)',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <div style={{ width: `${energyMix.solar}%`, height: '100%', backgroundColor: colors.solar }} title={`Solar: ${energyMix.solar}%`} />
        <div style={{ width: `${energyMix.wind}%`, height: '100%', backgroundColor: colors.wind }} title={`Wind: ${energyMix.wind}%`} />
        <div style={{ width: `${energyMix.battery}%`, height: '100%', backgroundColor: colors.battery }} title={`Battery: ${energyMix.battery}%`} />
        <div style={{ width: `${energyMix.grid}%`, height: '100%', backgroundColor: colors.grid }} title={`Grid: ${energyMix.grid}%`} />
      </div>
      <div style={{ 
        marginLeft: '10px', 
        fontSize: '12px',
        display: 'flex',
        gap: '8px'
      }}>
        <span style={{ color: 'var(--jp-ui-font-color1)' }}>
          <span style={{ color: colors.solar }}>■</span> Solar {energyMix.solar}%
        </span>
        <span style={{ color: 'var(--jp-ui-font-color1)' }}>
          <span style={{ color: colors.wind }}>■</span> Wind {energyMix.wind}%
        </span>
        <span style={{ color: 'var(--jp-ui-font-color1)' }}>
          <span style={{ color: colors.battery }}>■</span> Battery {energyMix.battery}%
        </span>
        <span style={{ color: 'var(--jp-ui-font-color1)' }}>
          <span style={{ color: colors.grid }}>■</span> Grid {energyMix.grid}%
        </span>
      </div>
    </div>
  );
};

// Add this new component for the countdown
const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 16,
    minutes: 12,
    seconds: 30
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        let newSeconds = prev.seconds - 1;
        let newMinutes = prev.minutes;
        let newHours = prev.hours;

        if (newSeconds < 0) {
          newSeconds = 59;
          newMinutes -= 1;
        }
        if (newMinutes < 0) {
          newMinutes = 59;
          newHours -= 1;
        }
        if (newHours < 0) {
          clearInterval(interval);
          return prev;
        }

        return {
          hours: newHours,
          minutes: newMinutes,
          seconds: newSeconds
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <p>
        Our runtime is experiencing high demand. 
      </p>
      <p>
        Your process will execute in{' '}
        <span style={{ fontWeight: 'bold' }}>
          {timeLeft.hours}hours {timeLeft.minutes}minutes and {timeLeft.seconds}seconds
        </span>
      </p>
    </>
  );
};

const extension: JupyterFrontEndPlugin<void> = {
  id: themeTogglerPluginId,
  autoStart: true,
  requires: [IThemeManager, INotebookTracker],
  optional: [IToolbarWidgetRegistry, ILayoutRestorer],
  activate: async (
    app: JupyterFrontEnd,
    themeManager: IThemeManager,
    notebookTracker: INotebookTracker,
    toolbarRegistry: IToolbarWidgetRegistry,
    restorer: ILayoutRestorer
  ): Promise<void> => {
    console.log('jupyterlab-theme-toggler extension is activated!');

    // Get app commands
    const { commands } = app;

    const themes = [
      'JupyterLab Light',
      'Darcula',
    ];

    const onChange = async () => {
      const isLight = themeManager.isLight(themeManager.theme);
      await commands.execute('apputils:change-theme', {
        theme: themes[~~isLight],
      });
    };

    if (toolbarRegistry) {
      toolbarRegistry.addFactory('TopBar', 'theme-toggler', () => {
        const widget = ReactWidget.create(
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ThemeSwitch themeManager={themeManager} onChange={onChange}>
              <span slot="unchecked-message">Light</span>
              <span slot="checked-message">Dark</span>
            </ThemeSwitch>
            <EnergyMixBar />
          </div>
        );
        return widget;
      });
    }

    // Add side panel with toggle
    const sidePanel = new Widget();
    sidePanel.id = 'jupyterlab-theme-toggler-panel';
    sidePanel.title.label = 'Enverge Stats';
    sidePanel.title.closable = true;
    
    const toggleId = 'cell-alert-toggle';
    sidePanel.node.innerHTML = `
      <div style="padding: 16px">
        <div style="margin-bottom: 16px">
          <label>
            GPU Type:
            <select style="margin-left: 8px; padding: 4px; width: 120px">
              <option value="H200" selected>H200 (141GB)</option>
              <option value="A100">A100 (80GB)</option>
              <option value="L4">L4 (24GB)</option>
              <option value="T4">T4 (16GB)</option>
            </select>
          </label>
        </div>

        <div style="margin-bottom: 16px">
          GPU Memory Usage:
          <div style="
            margin-top: 8px;
            width: 100%;
            height: 20px;
            background: var(--jp-layout-color2);
            border-radius: 4px;
            overflow: hidden;
          ">
            <div style="
              width: 85%;
              height: 100%;
              background: var(--jp-brand-color1);
              position: relative;
            ">
              <span style="
                position: absolute;
                right: 4px;
                color: white;
                font-size: 12px;
                line-height: 20px;
              ">120GB / 141GB</span>
            </div>
          </div>
        </div>

        Compute time used this month:<br>
        14 hours
        <br><br>

        Credits left: 100 hours
        <br>
        <br>
        Energy Usage Stats:<br>
        Current Power: 2.5 kW<br>
        Daily Usage: 45 kWh<br><br>
        <label>
          <input type="checkbox" id="${toggleId}"> Simulate Congestion
        </label>
      </div>
    `;

    // Add to right side panel
    app.shell.add(sidePanel, 'right');
    
    if (restorer) {
      restorer.add(sidePanel, sidePanel.id);
    }

    // Add cell execution listener with toggle check
    notebookTracker.currentChanged.connect((_, notebook) => {
      if (notebook) {
        NotebookActions.executed.connect((_, args) => {
          const toggle = document.getElementById(toggleId) as HTMLInputElement;
          if (toggle?.checked) {
            void showDialog({
              title: 'Congestion Alert',
              body: (
                <div>
                  <CountdownTimer />
                  <div style={{ marginTop: '10px', marginBottom: '10px' }}>
                    <label>
                      Purchase priority runtime (hours):{' '}
                      <select defaultValue="1">
                        <option value="1">1 hour ($3)</option>
                        <option value="4">4 hours ($12)</option>
                        <option value="8">8 hours ($24)</option>
                        <option value="24">24 hours ($150)</option>
                      </select>
                    </label>
                  </div>
                  <button 
                    className="jp-mod-styled"
                    onClick={(e) => {
                      e.preventDefault();
                      const paymentArea = document.getElementById('payment-area');
                      if (paymentArea) {
                        paymentArea.style.display = 'block';
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      backgroundColor: 'var(--jp-brand-color1)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginTop: '5px',
                      marginBottom: '5px',
                      lineHeight: '15px'
                    }}>
                    Purchase Priority Runtime
                  </button>
                  <div 
                    id="payment-area"
                    style={{ 
                      display: 'none',
                      border: '1px solid var(--jp-border-color1)',
                      borderRadius: '4px',
                      padding: '15px',
                      marginTop: '10px'
                    }}>
                    <input
                      type="text"
                      placeholder="Card number"
                      style={{
                        width: '100%',
                        padding: '8px',
                        marginBottom: '10px',
                        border: '1px solid var(--jp-border-color1)',
                        borderRadius: '4px'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        style={{
                          width: '50%',
                          padding: '8px',
                          border: '1px solid var(--jp-border-color1)',
                          borderRadius: '4px'
                        }}
                      />
                      <input
                        type="text"
                        placeholder="CVC"
                        style={{
                          width: '50%',
                          padding: '8px',
                          border: '1px solid var(--jp-border-color1)',
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                    <button 
                      className="jp-mod-styled"
                      onClick={() => {
                        const cardNumber = (document.querySelector('input[placeholder="Card number"]') as HTMLInputElement)?.value;
                        const expiry = (document.querySelector('input[placeholder="MM/YY"]') as HTMLInputElement)?.value;
                        const cvc = (document.querySelector('input[placeholder="CVC"]') as HTMLInputElement)?.value;
                        
                        alert(`Card Details:\nNumber: ${cardNumber}\nExpiry: ${expiry}\nCVC: ${cvc}`);
                      }}
                      style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: 'var(--jp-brand-color1)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginTop: '5px',
                        marginBottom: '5px',
                        lineHeight: '15px'
                      }}>
                      Submit Payment
                    </button>
                  </div>
                  <div style={{ marginTop: '10px', textAlign: 'right' }}>
                    <a href="https://docs.enverge.ai" target="_blank" rel="noopener noreferrer">
                      Click here to learn more
                    </a>
                  </div>
                </div>
              ),
              buttons: [
                Dialog.cancelButton()
              ]
            });
          }
        });
      }
    });
  },
};

export default extension;
