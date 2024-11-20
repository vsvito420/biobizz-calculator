import React, { useState, useEffect } from 'react'

const dosages = {
  allmix: {
    "Root Juice":   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    "Bio Grow":     [1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    "Fish Mix":     [1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    "Bio Bloom":    [1, 2, 2, 3, 3, 4, 4, 4, 0, 0],
    "Top Max":      [1, 1, 1, 1, 1, 4, 4, 4, 0, 0],
    "Bio Heaven":   [2, 2, 3, 4, 4, 5, 5, 5, 0, 0],
    "Acti Vera":    [2, 2, 3, 4, 4, 5, 5, 5, 0, 0],
    "Microbes":     [0.2, 0.2, 0.4, 0.4, 0.2, 0.2, 0.2, 0, 0, 0]
  },
  lightmix: {
    "Root Juice":   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    "Bio Grow":     [2, 2, 3, 3, 4, 4, 4, 4, 0, 0],
    "Fish Mix":     [2, 2, 3, 3, 4, 4, 4, 4, 0, 0],
    "Bio Bloom":    [1, 2, 2, 3, 3, 4, 4, 4, 0, 0],
    "Top Max":      [1, 1, 1, 1, 1, 4, 4, 4, 0, 0],
    "Bio Heaven":   [2, 2, 3, 4, 4, 5, 5, 5, 0, 0],
    "Acti Vera":    [2, 2, 3, 4, 4, 5, 5, 5, 0, 0],
    "Alg A Mic":    [1, 2, 2, 3, 3, 4, 4, 4, 0, 0],
    "Microbes":     [0.2, 0.2, 0.4, 0.4, 0.2, 0.2, 0.2, 0, 0, 0]
  }
}

const colors = {
  "Root Juice": "#6f564f",
  "Bio Grow": "#3c6e41",
  "Fish Mix": "#164178",
  "Bio Bloom": "#ff6e5a",
  "Top Max": "#b93d3b",
  "Bio Heaven": "#39a0a7",
  "Acti Vera": "#629a3c",
  "Alg A Mic": "#3ab34a",
  "Microbes": "#2b231c"
}

function App() {
  const [waterAmount, setWaterAmount] = useState(1)
  const [soilType, setSoilType] = useState('allmix')
  const [week, setWeek] = useState(0)
  const [notes, setNotes] = useState('')
  const [entries, setEntries] = useState([])
  const [phValue, setPhValue] = useState(6.5)
  const [ecValue, setEcValue] = useState(1.0)

  useEffect(() => {
    const savedEntries = localStorage.getItem('biobizzEntries')
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries))
    }
  }, [])

  const normalizeValue = (value, liters) => {
    return value / liters
  }

  const getMinMaxValues = () => {
    if (entries.length === 0) return { ph: [0, 14], ec: [0, 5] }
    
    return entries.reduce((acc, entry) => {
      acc.ph[0] = Math.min(acc.ph[0], entry.ph)
      acc.ph[1] = Math.max(acc.ph[1], entry.ph)
      acc.ec[0] = Math.min(acc.ec[0], entry.ec)
      acc.ec[1] = Math.max(acc.ec[1], entry.ec)
      return acc
    }, { 
      ph: [14, 0],
      ec: [Number.MAX_VALUE, 0]
    })
  }

  const getPercentage = (value, min, max) => {
    return ((value - min) / (max - min)) * 100
  }

  const calculateDosage = () => {
    const currentDosages = dosages[soilType]
    return Object.entries(currentDosages).reduce((acc, [product, weeklyDosages]) => {
      const dosagePerLiter = weeklyDosages[week]
      acc[product] = (waterAmount * dosagePerLiter).toFixed(1)
      return acc
    }, {})
  }

  const renderValueBar = (value, minMax, label, color) => {
    const percentage = getPercentage(value, minMax[0], minMax[1])
    return (
      <div className="value-bar-container">
        <span className="value-label">{label}: {value}</span>
        <div className="value-bar">
          <div 
            className="value-bar-fill" 
            style={{ 
              width: `${percentage}%`,
              backgroundColor: color
            }}
          />
        </div>
      </div>
    )
  }

  const renderDosageBar = (dosages, waterAmount) => {
    const normalizedDosages = Object.entries(dosages)
      .reduce((acc, [product, amount]) => {
        acc[product] = normalizeValue(parseFloat(amount), waterAmount)
        return acc
      }, {})

    let currentPosition = 0
    const totalDosage = Object.values(normalizedDosages)
      .reduce((sum, val) => sum + val, 0)

    return (
      <div className="stacked-bar">
        {Object.entries(normalizedDosages).map(([product, amount]) => {
          const percentage = (amount / totalDosage) * 100
          if (percentage === 0) return null
          
          const style = {
            position: 'absolute',
            left: `${currentPosition}%`,
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: colors[product],
          }
          
          currentPosition += percentage
          
          return (
            <div 
              key={product} 
              style={style} 
              title={`${product}: ${amount.toFixed(1)}ml/L`}
            />
          )
        })}
      </div>
    )
  }

  const saveEntry = () => {
    const newEntry = {
      id: Date.now(),
      date: new Date().toISOString(),
      waterAmount,
      soilType,
      week: week + 1,
      dosages: calculateDosage(),
      notes,
      ph: phValue,
      ec: ecValue
    }

    const updatedEntries = [newEntry, ...entries]
    setEntries(updatedEntries)
    localStorage.setItem('biobizzEntries', JSON.stringify(updatedEntries))
    setNotes('')
  }

  const deleteEntry = (id) => {
    const updatedEntries = entries.filter(entry => entry.id !== id)
    setEntries(updatedEntries)
    localStorage.setItem('biobizzEntries', JSON.stringify(updatedEntries))
  }

  const dosageResults = calculateDosage()
  const totalDosage = Object.values(dosageResults)
    .reduce((sum, val) => sum + parseFloat(val), 0)

  return (
    <div className="calculator">
      <h1>Biobizz Dünger Tracker</h1>
      
      <div className="input-section">
        <div className="input-group">
          <label>Wassermenge (Liter):</label>
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={waterAmount}
            onChange={(e) => setWaterAmount(parseFloat(e.target.value))}
          />
        </div>

        <div className="input-group">
          <label>Substrat:</label>
          <select 
            value={soilType}
            onChange={(e) => setSoilType(e.target.value)}
          >
            <option value="allmix">All Mix</option>
            <option value="lightmix">Light Mix</option>
          </select>
        </div>

        <div className="input-group">
          <label>Woche:</label>
          <select 
            value={week}
            onChange={(e) => setWeek(parseInt(e.target.value))}
          >
            {[...Array(10)].map((_, i) => (
              <option key={i} value={i}>Woche {i + 1}</option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label>pH-Wert:</label>
          <input
            type="number"
            min="0"
            max="14"
            step="0.1"
            value={phValue}
            onChange={(e) => setPhValue(parseFloat(e.target.value))}
          />
        </div>

        <div className="input-group">
          <label>EC-Wert:</label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={ecValue}
            onChange={(e) => setEcValue(parseFloat(e.target.value))}
          />
        </div>
      </div>

      <div className="visualization">
        <h2>Aktuelle Dosierung ({totalDosage}ml gesamt)</h2>
        {renderDosageBar(dosageResults, waterAmount)}
      </div>

      <div className="notes-section">
        <label>Notizen:</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Zusätzliche Beobachtungen oder Notizen..."
        />
        <button onClick={saveEntry}>Eintrag Speichern</button>
      </div>

      <div className="entries-section">
        <h2>Bisherige Einträge</h2>
        {entries.map(entry => {
          const minMaxValues = getMinMaxValues()
          
          return (
            <div key={entry.id} className="entry">
              <div className="entry-header">
                <span className="entry-date">
                  {new Date(entry.date).toLocaleDateString()} {new Date(entry.date).toLocaleTimeString()}
                </span>
                <button 
                  className="delete-button"
                  onClick={() => deleteEntry(entry.id)}
                >
                  ×
                </button>
              </div>
              <div className="entry-details">
                <div className="entry-meta">
                  <span>Woche {entry.week}</span>
                  <span>{entry.waterAmount}L</span>
                  <span>{entry.soilType}</span>
                </div>
                
                <div className="entry-values">
                  {renderValueBar(entry.ph, minMaxValues.ph, "pH", "#ff7043")}
                  {renderValueBar(entry.ec, minMaxValues.ec, "EC", "#42a5f5")}
                </div>

                <div className="entry-dosage-visualization">
                  <label>Düngerverhältnis (pro Liter):</label>
                  {renderDosageBar(entry.dosages, entry.waterAmount)}
                </div>

                {entry.notes && <p className="entry-notes">{entry.notes}</p>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default App
