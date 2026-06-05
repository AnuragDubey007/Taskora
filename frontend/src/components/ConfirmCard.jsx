import useTaskStore from '../store/taskStore'

function ConfirmCard() {
  const confirmCard = useTaskStore(s => s.confirmCard)

  if (!confirmCard) return null

  return (
    <div className={`confirm-card ${confirmCard.glow || ''}`}>
      <h3 className="text-lg font-bold text-white mb-2">{confirmCard.title}</h3>
      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{confirmCard.desc}</p>
      {!confirmCard.glow && (
        <p className="text-xs mt-3 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Respond via voice...
        </p>
      )}
    </div>
  )
}

export default ConfirmCard
