import { useEffect, useState } from 'react'
import {
  isStoreOpenNow,
  minutesUntilClosing,
} from '../utils/storeHours'
import useOrdersStore from '../store/ordersStore'
import useShopSettingsStore from '../store/shopSettingsStore'

export default function CustomerBanners() {
  const [closingSoon, setClosingSoon] = useState(false)
  const checkDailyReset = useOrdersStore((s) => s.checkDailyReset)
  const orderingOpen = useShopSettingsStore((s) => s.orderingOpen)

  useEffect(() => {
    function tick() {
      checkDailyReset()
      if (!isStoreOpenNow()) {
        setClosingSoon(false)
        return
      }
      const m = minutesUntilClosing()
      setClosingSoon(m != null && m > 0 && m <= 30)
    }
    tick()
    const iv = setInterval(tick, 20000)
    return () => clearInterval(iv)
  }, [checkDailyReset])

  const mLeft = minutesUntilClosing()

  return (
    <>
      {!orderingOpen && (
        <div className="bg-red-800 text-white px-4 py-3 text-center shadow-md">
          <p className="font-black text-sm sm:text-base">
            Εκτός λειτουργίας — δεν δεχόμαστε παραγγελίες μέσω του site αυτή τη στιγμή
          </p>
          <p className="text-xs sm:text-sm text-red-100 mt-1 font-semibold">
            Για παραγγελία επικοινωνήστε τηλεφωνικά με το κατάστημα
          </p>
        </div>
      )}

      <div
        className={`px-3 py-2 text-center text-sm font-bold transition-colors ${
          !orderingOpen
            ? 'bg-slate-700 text-slate-200'
            : 'bg-green-600 text-white'
        }`}
      >
        {!orderingOpen ? (
          <span>Online παραγγελίες κλειστές — μόνο ενημέρωση καταστήματος</span>
        ) : (
          <span>Κατάστημα online — δεχόμαστε παραγγελίες τώρα</span>
        )}
      </div>

      {orderingOpen && closingSoon && mLeft != null && (
        <div className="bg-amber-500 text-amber-950 px-4 py-3 text-center shadow-md">
          <p className="font-black text-base sm:text-lg">
            Σε περίπου {mLeft} λεπτά κλείνουμε — προλάβετε την παραγγελία σας
          </p>
          <p className="text-sm font-semibold mt-1 opacity-90">
            Το κατάστημα κλείνει σύντομα σύμφωνα με το ωράριό μας
          </p>
        </div>
      )}
    </>
  )
}
