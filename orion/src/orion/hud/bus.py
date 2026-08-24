"""A tiny thread-safe event bus with catch-up.

The agent, the voice controller and the heartbeat publish; each connected HUD
page subscribes. A ring buffer of recent events means a page opened
mid-conversation back-fills the feed instead of starting blank — the same
catch-up-on-return principle the notice board follows.
"""

from __future__ import annotations

import itertools
import queue
import threading
import time
from collections import deque


class EventBus:
    def __init__(self, history: int = 200) -> None:
        self._lock = threading.Lock()
        self._subscribers: dict[int, "queue.Queue[dict]"] = {}
        self._ids = itertools.count()
        self._history: deque[dict] = deque(maxlen=history)

    def publish(self, kind: str, data: dict | None = None) -> None:
        event = {"kind": kind, "ts": time.time(), **(data or {})}
        with self._lock:
            self._history.append(event)
            subscribers = list(self._subscribers.values())
        for q in subscribers:
            try:
                q.put_nowait(event)
            except queue.Full:
                pass  # a stalled page loses events; the live agent never blocks

    def subscribe(self, *, replay: bool = True) -> tuple[int, "queue.Queue[dict]"]:
        q: "queue.Queue[dict]" = queue.Queue(maxsize=1000)
        with self._lock:
            sub_id = next(self._ids)
            if replay:
                for event in self._history:
                    q.put_nowait(event)
            self._subscribers[sub_id] = q
        return sub_id, q

    def unsubscribe(self, sub_id: int) -> None:
        with self._lock:
            self._subscribers.pop(sub_id, None)

    def recent(self) -> list[dict]:
        with self._lock:
            return list(self._history)
