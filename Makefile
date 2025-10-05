# Description: Network Monitor for LuCI
# Author: Fidz
# Referensi: RizkyKotet-Dev
# License: Unlicense

include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-netmonitor
PKG_VERSION:=1.1.7
PKG_RELEASE:=05102025

PKG_MAINTAINER:=Fidz
PKG_LICENSE:=Unlicense
PKG_LICENSE_FILES:=LICENSE

LUCI_TITLE:=LuCI Network Monitor
LUCI_DESCRIPTION:=Network monitoring application for LuCI
LUCI_DEPENDS:=+libc +netdata +vnstat2 +vnstati2
LUCI_PKGARCH:=all

include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - OpenWrt buildroot signature
$(eval $(call BuildPackage,$(PKG_NAME)))
