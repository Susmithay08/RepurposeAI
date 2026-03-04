import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap, Link2, FileText, Copy, Check, Trash2,
  AlertCircle, Loader2, KeyRound, Eye, EyeOff,
  Twitter, Linkedin, Mail, BookOpen, ArrowLeft,
  ExternalLink, Clock, Sparkles
} from 'lucide-react'
import { useStore } from '../store'
import { formatDistanceToNow } from 'date-fns'

const TABS = [
  { id: 'tldr', label: 'TL;DR', icon: BookOpen, color: '#FCD34D', soft: 'rgba(252,211,77,0.08)', border: 'rgba(252,211,77,0.2)' },
  { id: 'twitter', label: 'Twitter Thread', icon: Twitter, color: '#1D9BF0', soft: 'rgba(29,155,240,0.08)', border: 'rgba(29,155,240,0.18)' },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: '#60A5FA', soft: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.18)' },
  { id: 'email', label: 'Email', icon: Mail, color: '#F472B6', soft: 'rgba(244,114,182,0.08)', border: 'rgba(244,114,182,0.18)' },
]

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} className={`copy-btn${copied ? ' copied' : ''}`}>
      {copied ? <><Check size={11} /> Copied!</> : <><Copy size={11} /> Copy</>}
    </button>
  )
}

function TweetCard({ tweet, index }) {
  const [copied, setCopied] = useState(false)
  const over = tweet.length > 280
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}
      style={{
        padding: '14px 16px', borderRadius: 10,
        background: 'var(--bg3)', border: '1px solid var(--border2)', marginBottom: 8
      }}>
      <div style={{ display: 'flex', gap: 10 }}>
        <span style={{
          width: 26, height: 26, borderRadius: 8, background: 'rgba(29,155,240,0.1)',
          color: '#1D9BF0', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexShrink: 0, fontFamily: 'var(--mono)'
        }}>{index + 1}</span>
        <p style={{ flex: 1, fontSize: 13, lineHeight: 1.7 }}>{tweet}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
        <span style={{
          fontSize: 11, fontFamily: 'var(--mono)',
          color: over ? 'var(--red)' : tweet.length > 240 ? 'var(--tldr)' : 'var(--text3)'
        }}>
          {tweet.length}/280
        </span>
        <button onClick={() => { navigator.clipboard.writeText(tweet); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
          className={`copy-btn${copied ? ' copied' : ''}`} style={{ fontSize: 10, padding: '3px 10px' }}>
          {copied ? '✓ Copied' : 'Copy tweet'}
        </button>
      </div>
    </motion.div>
  )
}

function OutputContent({ current, activeTab }) {
  if (activeTab === 'tldr') return (
    <motion.div key="tldr" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <p style={{
          fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)',
          textTransform: 'uppercase', letterSpacing: '0.09em'
        }}>Summary</p>
        <CopyButton text={current.tldr} />
      </div>
      <div style={{
        padding: '24px', borderRadius: 14,
        background: 'rgba(252,211,77,0.04)', border: '1px solid rgba(252,211,77,0.15)'
      }}>
        <p style={{ fontSize: 16, lineHeight: 1.9, color: 'var(--text)' }}>{current.tldr}</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 14 }}>
        {[
          { label: 'Words', value: current.word_count?.toLocaleString() },
          { label: 'Tweets', value: current.twitter_thread?.length },
          { label: 'Source', value: current.source_type },
        ].map(({ label, value }) => (
          <div key={label} style={{
            padding: '14px', borderRadius: 10, textAlign: 'center',
            background: 'var(--bg3)', border: '1px solid var(--border2)'
          }}>
            <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--lime)', marginBottom: 3 }}>{value}</p>
            <p style={{ fontSize: 11, color: 'var(--text3)' }}>{label}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )

  if (activeTab === 'twitter') {
    const full = current.twitter_thread?.join('\n\n') || ''
    return (
      <motion.div key="twitter" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <p style={{
            fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)',
            textTransform: 'uppercase', letterSpacing: '0.09em'
          }}>
            {current.twitter_thread?.length} tweets
          </p>
          <CopyButton text={full} />
        </div>
        {current.twitter_thread?.map((t, i) => <TweetCard key={i} tweet={t} index={i} />)}
      </motion.div>
    )
  }

  if (activeTab === 'linkedin') return (
    <motion.div key="linkedin" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <p style={{
          fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)',
          textTransform: 'uppercase', letterSpacing: '0.09em'
        }}>LinkedIn Post</p>
        <CopyButton text={current.linkedin_post} />
      </div>
      <div style={{
        padding: '24px', borderRadius: 14,
        background: 'rgba(96,165,250,0.04)', border: '1px solid rgba(96,165,250,0.15)'
      }}>
        <p style={{ fontSize: 14, lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>{current.linkedin_post}</p>
      </div>
      <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8, textAlign: 'right', fontFamily: 'var(--mono)' }}>
        {current.linkedin_post?.split(' ').length} words
      </p>
    </motion.div>
  )

  if (activeTab === 'email') {
    const lines = current.email_newsletter?.split('\n') || []
    const subjectLine = lines.find(l => l.startsWith('Subject:')) || ''
    const body = lines.filter(l => !l.startsWith('Subject:')).join('\n').trim()
    return (
      <motion.div key="email" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <p style={{
            fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)',
            textTransform: 'uppercase', letterSpacing: '0.09em'
          }}>Email Newsletter</p>
          <CopyButton text={current.email_newsletter} />
        </div>
        {subjectLine && (
          <div style={{
            padding: '11px 16px', borderRadius: 10, marginBottom: 10,
            background: 'rgba(244,114,182,0.06)', border: '1px solid rgba(244,114,182,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--email)' }}>{subjectLine}</p>
            <CopyButton text={subjectLine.replace('Subject: ', '')} />
          </div>
        )}
        <div style={{
          padding: '24px', borderRadius: 14,
          background: 'rgba(244,114,182,0.03)', border: '1px solid rgba(244,114,182,0.12)'
        }}>
          <p style={{ fontSize: 14, lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>{body}</p>
        </div>
      </motion.div>
    )
  }
  return null
}

export default function App() {
  const {
    groqApiKey, setGroqApiKey, history, current, loading, error,
    repurpose, fetchHistory, loadItem, deleteItem, clearCurrent,
  } = useStore()

  const [mode, setMode] = useState('text')
  const [content, setContent] = useState('')
  const [activeTab, setActiveTab] = useState('tldr')
  const [showKeyInput, setShowKeyInput] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [keyDraft, setKeyDraft] = useState('')
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => { fetchHistory() }, [])

  const handleRepurpose = async () => {
    if (!content.trim()) return
    setActiveTab('tldr')
    await repurpose({ content, sourceType: mode })
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Top Nav ── */}
      <nav style={{
        borderBottom: '1px solid var(--border2)', background: 'var(--bg2)',
        padding: '0 32px', display: 'flex', alignItems: 'center', gap: 16, height: 54,
        position: 'sticky', top: 0, zIndex: 100
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginRight: 12 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 9, display: 'flex', alignItems: 'center',
            justifyContent: 'center', background: 'var(--lime-soft)',
            border: '1px solid var(--lime-dim)', boxShadow: '0 0 16px var(--lime-glow)'
          }}>
            <Zap size={14} style={{ color: 'var(--lime)' }} />
          </div>
          <span style={{
            fontWeight: 800, fontSize: 14, color: 'var(--lime)', letterSpacing: '-0.01em',
            fontFamily: 'var(--mono)'
          }}>
            RepurposeAI
          </span>
        </div>

        {/* Format badges */}
        <div style={{ display: 'flex', gap: 5, flex: 1 }}>
          {TABS.map(({ id, label, icon: Icon, color }) => (
            <span key={id} style={{
              display: 'flex', alignItems: 'center', gap: 4, fontSize: 10,
              padding: '3px 10px', borderRadius: 20, fontWeight: 700,
              fontFamily: 'var(--mono)', letterSpacing: '0.03em',
              background: `${color}10`, color, border: `1px solid ${color}25`
            }}>
              <Icon size={10} />{label}
            </span>
          ))}
        </div>

        {/* API key */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowKeyInput(s => !s)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
              borderRadius: 9, fontSize: 12, border: '1px solid var(--border2)',
              background: groqApiKey ? 'var(--lime-soft)' : 'var(--bg3)',
              color: groqApiKey ? 'var(--lime)' : 'var(--text2)', transition: 'all 0.15s'
            }}>
            <KeyRound size={12} />
            {groqApiKey ? '✓ Key set' : 'Add API key'}
          </button>
          <AnimatePresence>
            {showKeyInput && (
              <motion.div initial={{ opacity: 0, y: 6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6 }}
                style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 280,
                  background: 'var(--bg2)', border: '1px solid var(--border2)',
                  borderRadius: 12, padding: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.6)', zIndex: 200
                }}>
                <p style={{
                  fontSize: 11, color: 'var(--text3)', marginBottom: 8,
                  fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em'
                }}>
                  Groq API Key
                </p>
                <div style={{ position: 'relative' }}>
                  <input className="input" type={showKey ? 'text' : 'password'}
                    placeholder="gsk_…" value={keyDraft || groqApiKey}
                    onChange={e => setKeyDraft(e.target.value)}
                    style={{ fontSize: 11, paddingRight: 54 }} />
                  <div style={{
                    position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                    display: 'flex', gap: 4
                  }}>
                    <button onClick={() => setShowKey(v => !v)} style={{ color: 'var(--text3)', padding: 2 }}>
                      {showKey ? <EyeOff size={11} /> : <Eye size={11} />}
                    </button>
                    <button onClick={() => { setGroqApiKey(keyDraft || groqApiKey); setKeyDraft(''); setShowKeyInput(false) }}
                      style={{ color: 'var(--lime)', fontWeight: 800, fontSize: 13, padding: 2 }}>✓</button>
                  </div>
                </div>
                <p style={{ fontSize: 10, color: 'var(--text3)', marginTop: 6 }}>
                  Free at <a href="https://console.groq.com" target="_blank"
                    style={{ color: 'var(--lime)' }}>console.groq.com</a>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* History */}
        <button onClick={() => setShowHistory(s => !s)} className="btn-ghost"
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', fontSize: 12,
            background: showHistory ? 'var(--lime-soft)' : 'transparent',
            borderColor: showHistory ? 'var(--lime-dim)' : 'var(--border2)',
            color: showHistory ? 'var(--lime)' : 'var(--text2)'
          }}>
          <Clock size={12} />
          History{history.length > 0 ? ` (${history.length})` : ''}
        </button>

        {current && (
          <button onClick={clearCurrent} className="btn-ghost"
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', fontSize: 12 }}>
            <ArrowLeft size={11} /> New
          </button>
        )}
      </nav>

      {/* ── History Drawer ── */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 88 }} />
            <motion.div initial={{ opacity: 0, x: 300 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                position: 'fixed', right: 0, top: 54, bottom: 0, width: 290, zIndex: 90,
                background: 'var(--bg2)', borderLeft: '1px solid var(--border2)',
                overflow: 'auto', padding: 16
              }}>
              <p style={{
                fontSize: 11, fontWeight: 700, marginBottom: 14, color: 'var(--lime)',
                fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em'
              }}>
                History ({history.length})
              </p>
              {history.length === 0 && (
                <p style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', marginTop: 40 }}>
                  Nothing yet
                </p>
              )}
              {history.map(h => (
                <div key={h.id}
                  onClick={() => { loadItem(h.id); setActiveTab('tldr'); setShowHistory(false) }}
                  style={{
                    padding: '11px 12px', borderRadius: 10, marginBottom: 6, cursor: 'pointer',
                    background: 'var(--bg3)',
                    border: `1px solid ${current?.id === h.id ? 'var(--lime-dim)' : 'var(--border2)'}`,
                    transition: 'border-color 0.12s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--lime-dim)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = current?.id === h.id ? 'var(--lime-dim)' : 'var(--border2)'}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: 12, fontWeight: 600, overflow: 'hidden',
                        textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3
                      }}>
                        {h.title || 'Untitled'}
                      </p>
                      <p style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
                        {h.source_type} · {h.created_at
                          ? formatDistanceToNow(new Date(h.created_at), { addSuffix: true })
                          : 'just now'}
                      </p>
                    </div>
                    <button onClick={e => { e.stopPropagation(); deleteItem(h.id) }}
                      style={{ color: 'var(--text4)', padding: 3, flexShrink: 0, transition: 'color 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text4)'}>
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content ── */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px' }}>
        <AnimatePresence mode="wait">

          {/* ── INPUT VIEW ── */}
          {!current ? (
            <motion.div key="input" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

              {/* Hero */}
              <div style={{ textAlign: 'center', marginBottom: 44 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 20, margin: '0 auto 20px',
                  background: 'var(--lime-soft)', border: '1px solid var(--lime-dim)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  animation: 'limeglow 3s ease infinite'
                }}>
                  <Sparkles size={28} style={{ color: 'var(--lime)' }} />
                </div>
                <h1 style={{
                  fontSize: 38, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 10,
                  color: 'var(--lime)'
                }}>
                  RepurposeAI
                </h1>
                <p style={{
                  color: 'var(--text2)', fontSize: 15, lineHeight: 1.8,
                  maxWidth: 480, margin: '0 auto'
                }}>
                  Paste a blog post or URL → get a Twitter thread, LinkedIn post,
                  email newsletter and TL;DR simultaneously.
                </p>
              </div>

              {/* Input card */}
              <div style={{
                background: 'var(--bg2)', border: '1px solid var(--border2)',
                borderRadius: 16, padding: 28, marginBottom: 16
              }}>

                {/* Mode toggle */}
                <div style={{
                  display: 'flex', gap: 4, marginBottom: 20, background: 'var(--bg3)',
                  padding: 4, borderRadius: 10, border: '1px solid var(--border2)', width: 'fit-content'
                }}>
                  {[
                    { id: 'text', icon: FileText, label: 'Paste Text' },
                    { id: 'url', icon: Link2, label: 'From URL' },
                  ].map(({ id, icon: Icon, label }) => (
                    <button key={id} onClick={() => { setMode(id); setContent('') }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '7px 18px',
                        borderRadius: 8, fontSize: 12, fontWeight: 600, transition: 'all 0.15s',
                        background: mode === id ? 'var(--bg5)' : 'transparent',
                        color: mode === id ? 'var(--lime)' : 'var(--text3)',
                        border: `1px solid ${mode === id ? 'var(--lime-dim)' : 'transparent'}`
                      }}>
                      <Icon size={12} />{label}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {mode === 'text' ? (
                    <motion.div key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <textarea className="input" value={content} onChange={e => setContent(e.target.value)}
                        placeholder="Paste your blog post, article, or any long-form content here…"
                        style={{ minHeight: 200, resize: 'vertical', lineHeight: 1.7, fontSize: 13 }} />
                      <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6, fontFamily: 'var(--mono)' }}>
                        {content.split(/\s+/).filter(Boolean).length} words
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div key="url" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <input className="input" value={content} onChange={e => setContent(e.target.value)}
                        placeholder="https://yourblog.com/your-post"
                        onKeyDown={e => e.key === 'Enter' && content.trim() && handleRepurpose()} />
                      <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>
                        We'll fetch and extract the article automatically
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      style={{
                        marginTop: 12, padding: '10px 14px', borderRadius: 9,
                        background: 'var(--red-soft)', border: '1px solid rgba(248,113,113,0.2)',
                        display: 'flex', gap: 8, alignItems: 'center'
                      }}>
                      <AlertCircle size={13} style={{ color: 'var(--red)', flexShrink: 0 }} />
                      <p style={{ fontSize: 12, color: 'var(--red)' }}>{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 20 }}>
                  <button onClick={handleRepurpose}
                    disabled={loading || !content.trim()} className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 32px', fontSize: 14 }}>
                    {loading
                      ? <><Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} /> Generating…</>
                      : <><Zap size={14} /> Repurpose</>
                    }
                  </button>
                  {!groqApiKey && (
                    <p style={{ fontSize: 12, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <AlertCircle size={11} /> Add API key ↗
                    </p>
                  )}
                </div>
              </div>

              {/* Format cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                {TABS.map(({ id, label, icon: Icon, color, soft, border }) => (
                  <div key={id} style={{
                    padding: '16px', borderRadius: 12,
                    background: 'var(--bg2)', border: `1px solid ${border}`
                  }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 9, margin: '0 0 10px',
                      background: soft, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: `1px solid ${border}`
                    }}>
                      <Icon size={15} style={{ color }} />
                    </div>
                    <p style={{ fontSize: 12, fontWeight: 700, color, marginBottom: 5 }}>{label}</p>
                    <p style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.5 }}>
                      {id === 'tldr' && '3-4 sentence summary'}
                      {id === 'twitter' && '8 tweets with char counts'}
                      {id === 'linkedin' && '150-300 word post + hashtags'}
                      {id === 'email' && 'Subject line + full newsletter'}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

          ) : (
            /* ── RESULTS VIEW ── */
            <motion.div key="results" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

              {/* Header */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%', background: 'var(--lime)',
                    flexShrink: 0, boxShadow: '0 0 8px var(--lime-glow)'
                  }} />
                  <h2 style={{
                    fontWeight: 800, fontSize: 20, letterSpacing: '-0.01em',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                  }}>
                    {current.title}
                  </h2>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', paddingLeft: 18 }}>
                  <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
                    {current.word_count?.toLocaleString()} words · {current.source_type}
                  </span>
                  {current.source_url && (
                    <a href={current.source_url} target="_blank"
                      style={{
                        fontSize: 11, color: 'var(--lime)', display: 'flex', alignItems: 'center', gap: 3,
                        textDecoration: 'none'
                      }}>
                      <ExternalLink size={10} /> source
                    </a>
                  )}
                  <CopyButton text={[
                    `TL;DR:\n${current.tldr}`,
                    `\n\nTWITTER:\n${current.twitter_thread?.join('\n\n')}`,
                    `\n\nLINKEDIN:\n${current.linkedin_post}`,
                    `\n\nEMAIL:\n${current.email_newsletter}`,
                  ].join('')} />
                </div>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border2)', marginBottom: 24 }}>
                {TABS.map(({ id, label, icon: Icon, color }) => (
                  <button key={id} onClick={() => setActiveTab(id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px',
                      fontSize: 13, fontWeight: 600, transition: 'all 0.15s', whiteSpace: 'nowrap',
                      borderBottom: `2px solid ${activeTab === id ? color : 'transparent'}`,
                      color: activeTab === id ? color : 'var(--text3)',
                      background: 'transparent', marginBottom: -1
                    }}>
                    <Icon size={13} />{label}
                  </button>
                ))}
              </div>

              {/* Output */}
              <AnimatePresence mode="wait">
                <OutputContent key={activeTab} current={current} activeTab={activeTab} />
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
