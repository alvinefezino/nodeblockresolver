'use client'

import { useState, useMemo } from 'react'
import ContactModal from './ContactModal'
import styles from './page.module.css'

type CircleItem = {
  id: string
  label: string
  image: string | null
}

// --------------------------------------------------------------------------
// Real wallet names, matching the reference screenshots. Each gets a
// placeholder image built from its initial for now — swap `image` for a
// real path (e.g. '/icons/metamask.png') whenever you have actual logos.
// --------------------------------------------------------------------------
const WALLET_NAMES = [
  'UNISWAP Wallet', 'Best Wallet', 'Wallet Connect', 'Trust', 'Metamask', 'Ledger',
  'Coinbase', 'Unisat Wallet', 'Solfare Wallet', 'Phantom wallet', 'Solana Wallet', 'Tangem Wallet',
  'coldcard wallet', 'Xaman wallet', 'Trojan Bot', 'okx Wallet', 'Sui Wallet', 'Leather Wallet',
  'APTOS Wallet', 'Asigna Wallet', 'AVAXC Wallet', 'Base Wallet', 'BITTENSOR Wallet', 'AURORA Wallet',
  'Xverse Wallet', 'OPTIMISM Wallet', 'MyTon Wallet', 'Tonkeeper Wallet', 'TonHub Wallet', 'Electrum Wallet',
  'Magic Eden', 'STACKS Wallet', 'MOONBEAM', 'BRD wallet', 'ETHPOW wallet', 'TON wallet',
  'Saitamask wallet', 'ARBITRUM wallet', 'Terra station', 'METIS station', 'CRO wallet', 'Cosmos station',
  'CUBE Wallet', 'Exodus wallet', 'OKC wallet', 'Rainbow', 'HECO', 'Argent',
  'MOONRIVER', 'Binance Chain', 'Safemoon', 'CELO', 'Gnosis Safe', 'FANTOM',
  'DeFi', 'LITECOIN', 'Pillar', 'imToken', 'POLYGON', 'CORE',
  'BITCOINCASH', 'ONTO', 'BOBA', 'EVMOS', 'THORCHAIN', 'TokenPocket',
  'Aave', 'Digitex', 'Portis', 'Formatic', 'MathWallet', 'BitPay',
  'Ledger Live', 'WallETH', 'Authereum', 'Dharma', '1inch Wallet', 'Huobi',
  'Eidoo', 'MYKEY', 'Loopring', 'TrustVault', 'Atomic', 'Coin98',
  'Tron', 'Alice', 'KUJIRA', 'AKASH', 'UMEE', 'IRIS',
  'REGEN', 'GNOSIS', 'OSMOSIS', 'BITSONG', 'KI', 'SECRET',
  'CRO-COSMOS', 'LUM', 'STARNAME', 'SIF', 'BITCANNA', 'DESMOS',
  'JUNO', 'PERSISTENCE', 'SENTINEL', 'EMONEY', 'KONSTELLATION', 'STARGAZE',
  'MARS', 'STRIDE', 'NOM', 'CHIHUAHUA', 'FETCH AI', 'METER',
  'INJECTIVE', 'COMDEX', 'BANDCHAIN', 'KUSAMA', 'HATHOR', 'LUNA',
  'ENJIN', 'ALEPHIUM', 'HIVE', 'AlphaWallet', 'XDC', 'NORDEK',
  'BROCK', 'ARBITRUM NOVA', 'ZKSYNC ERA', 'AIRDAO', 'ETC', 'REI',
  'RSK', 'THETA', 'CASPER', 'BOBA BNB', 'TENET', 'POLYGON ZKEVM',
  'SEI', 'MANTLE', 'SYSCOIN', 'TARAXA', 'LINEA', 'OPBNB',
  'LUKSO', 'CELESTIA', 'NEUTRON', 'ORAI', 'EWT', 'FLARE',
  'MANTA', 'ZETACHAIN', 'TOMOCHAIN', 'WANCHAIN', 'ELECTRONEUM', 'ZKLINK NOVA',
  'TAIKO', 'WEMIX', 'BITGERT', 'DYDX', 'ASTAR', 'NANO',
  'POCKET', "D'CENT", 'FUSE', 'DOGE', 'COSMOS', 'ZelCore',
  'KCC', 'KAVA EVM', 'KAVA IBC', 'BLAST', 'BOUNCEBIT', 'NIBIRU',
  'RONIN', 'XPLA', 'ANDROMEDA', 'SAGA', 'TELOSEVM', 'MICRO VISION CHAIN',
  'DYMENSION IBC', 'DYMENSION EVM', 'ZIRCUIT', 'KASPA', 'RIPPLE', 'AZERO',
  'POLKADOT', 'DOGECHAIN', 'WALTONCHAIN', 'ARWEAVE', 'INTERNET COMPUTER', 'FLUX',
  'NEXA', 'COMAI', 'MAPO', 'SCROLL', 'MODE', 'MERLIN',
  'STARKNET', 'CARDANO', 'ALGORAND', 'MONERO', 'STELLAR', 'FILECOIN',
  'DOR', 'DAG', 'VENOM', 'PARTISIA', 'AVAIL', 'RAVEN',
  'HEDERA', 'EOS', 'EGLD', 'XTZ', 'FLOW', 'CONFLUX',
  'NEAR', 'PHANTASMA', 'Coinmoni', 'GridPlus', 'CYBAVO', 'Tokenary',
  'Torus', 'Spatium', 'SafePal', 'Infinito', 'wallet.io', 'Ownbit',
  'EasyPocket', 'Bridge Wallet', 'Spark Point', 'ViaWallet', 'BitKeep', 'Vision',
  'PEAKDEFI', 'Unstoppable', 'HaloDeFi', 'Dok Wallet', 'Midas', 'Ellipal',
  'KEYRING PRO', 'Aktionariat', 'Talken', 'Flare', 'KyberSwap', 'PayTube',
  'Linen',
]

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

const items: CircleItem[] = WALLET_NAMES.map((name, index) => ({
  id: `${slugify(name)}-${index}`,
  label: name,
  image: `https://placehold.co/100x100/000000/ffffff/png?text=${encodeURIComponent(
    name.trim()[0]?.toUpperCase() ?? '?'
  )}`,
}))

export default function ContactPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [activeItem, setActiveItem] = useState<CircleItem | null>(null)
  const [query, setQuery] = useState('')

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((item) => item.label.toLowerCase().includes(q))
  }, [query])

  function handleCircleClick(item: CircleItem) {
    setActiveItem(item)
    setModalOpen(true)
  }

  function handleClose() {
    setModalOpen(false)
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headerIcon} aria-hidden="true">
          ◆
        </div>
        <h1 className={styles.pageTitle}>Connect Wallet</h1>
        <p className={styles.pageSubtitle}>Please connect your wallet to continue</p>

        <div className={styles.searchWrap}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search wallet names..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <p className={styles.noResults}>No wallets match &quot;{query}&quot;</p>
      ) : (
        <div className={styles.circleGrid}>
          {filteredItems.map((item) => (
            <div key={item.id} className={styles.circleWrapper}>
              <button
                type="button"
                className={styles.circle}
                onClick={() => handleCircleClick(item)}
              >
                {item.image ? (
                  <img src={item.image} alt={item.label} className={styles.circleImage} />
                ) : (
                  item.id
                )}
              </button>
              <span className={styles.circleLabel}>{item.label}</span>
            </div>
          ))}
        </div>
      )}

      <ContactModal
        open={modalOpen}
        onClose={handleClose}
        selectedItem={activeItem}
      />
    </div>
  )
}