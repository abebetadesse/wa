/**
 * Administrative Region -> Zone -> District/Town records imported from the
 * user-provided Region, Zone, Town.odt file. These are reference records only;
 * they do not imply coordinates, population estimates, or clinical attributes.
 */
export interface EthiopianAdministrativePlace {
  id: string;
  region: string;
  zone: string;
  town: string;
  source: "Region, Zone, Town.odt";
  sourcePath: string;
}

export interface EthiopianAdministrativeZone {
  name: string;
  towns: string[];
}

export interface EthiopianAdministrativeRegion {
  name: string;
  zones: EthiopianAdministrativeZone[];
  townCount: number;
}

export const ETHIOPIAN_ADMINISTRATIVE_PLACES: EthiopianAdministrativePlace[] = [
  {
    "id": "admin-sheger-sheger-sida-awash",
    "region": "Sheger",
    "zone": "Sheger",
    "town": "Sida Awash",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-addis-ketema-wereda-01",
    "region": "Addis Ababa",
    "zone": "Addis Ketema",
    "town": "Wereda 01",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-addis-ketema-wereda-03",
    "region": "Addis Ababa",
    "zone": "Addis Ketema",
    "town": "Wereda 03",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-addis-ketema-wereda-04",
    "region": "Addis Ababa",
    "zone": "Addis Ketema",
    "town": "Wereda 04",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-addis-ketema-wereda-05",
    "region": "Addis Ababa",
    "zone": "Addis Ketema",
    "town": "Wereda 05",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-addis-ketema-wereda-06",
    "region": "Addis Ababa",
    "zone": "Addis Ketema",
    "town": "Wereda 06",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-addis-ketema-wereda-08",
    "region": "Addis Ababa",
    "zone": "Addis Ketema",
    "town": "Wereda 08",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-addis-ketema-wereda-09",
    "region": "Addis Ababa",
    "zone": "Addis Ketema",
    "town": "Wereda 09",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-addis-ketema-wereda-10",
    "region": "Addis Ababa",
    "zone": "Addis Ketema",
    "town": "Wereda 10",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-addis-ketema-wereda-11",
    "region": "Addis Ababa",
    "zone": "Addis Ketema",
    "town": "Wereda 11",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-addis-ketema-wereda-12",
    "region": "Addis Ababa",
    "zone": "Addis Ketema",
    "town": "Wereda 12",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-addis-ketema-wereda-13",
    "region": "Addis Ababa",
    "zone": "Addis Ketema",
    "town": "Wereda 13",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-addis-ketema-wereda-14",
    "region": "Addis Ababa",
    "zone": "Addis Ketema",
    "town": "Wereda 14",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-akaki-kaliti-wereda-01",
    "region": "Addis Ababa",
    "zone": "Akaki Kaliti",
    "town": "Wereda 01",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-akaki-kaliti-wereda-02",
    "region": "Addis Ababa",
    "zone": "Akaki Kaliti",
    "town": "Wereda 02",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-akaki-kaliti-wereda-03",
    "region": "Addis Ababa",
    "zone": "Akaki Kaliti",
    "town": "Wereda 03",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-akaki-kaliti-wereda-04",
    "region": "Addis Ababa",
    "zone": "Akaki Kaliti",
    "town": "Wereda 04",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-akaki-kaliti-wereda-05",
    "region": "Addis Ababa",
    "zone": "Akaki Kaliti",
    "town": "Wereda 05",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-akaki-kaliti-wereda-06",
    "region": "Addis Ababa",
    "zone": "Akaki Kaliti",
    "town": "Wereda 06",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-akaki-kaliti-wereda-07",
    "region": "Addis Ababa",
    "zone": "Akaki Kaliti",
    "town": "Wereda 07",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-akaki-kaliti-wereda-08",
    "region": "Addis Ababa",
    "zone": "Akaki Kaliti",
    "town": "Wereda 08",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-akaki-kaliti-wereda-09",
    "region": "Addis Ababa",
    "zone": "Akaki Kaliti",
    "town": "Wereda 09",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-akaki-kaliti-wereda-10",
    "region": "Addis Ababa",
    "zone": "Akaki Kaliti",
    "town": "Wereda 10",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-akaki-kaliti-wereda-12",
    "region": "Addis Ababa",
    "zone": "Akaki Kaliti",
    "town": "Wereda 12",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-akaki-kaliti-wereda-13",
    "region": "Addis Ababa",
    "zone": "Akaki Kaliti",
    "town": "Wereda 13",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-arada-wereda-01",
    "region": "Addis Ababa",
    "zone": "Arada",
    "town": "Wereda 01",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-arada-wereda-02",
    "region": "Addis Ababa",
    "zone": "Arada",
    "town": "Wereda 02",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-arada-wereda-03",
    "region": "Addis Ababa",
    "zone": "Arada",
    "town": "Wereda 03",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-arada-wereda-04",
    "region": "Addis Ababa",
    "zone": "Arada",
    "town": "Wereda 04",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-arada-wereda-05",
    "region": "Addis Ababa",
    "zone": "Arada",
    "town": "Wereda 05",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-arada-wereda-06",
    "region": "Addis Ababa",
    "zone": "Arada",
    "town": "Wereda 06",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-arada-wereda-07",
    "region": "Addis Ababa",
    "zone": "Arada",
    "town": "Wereda 07",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-arada-wereda-08",
    "region": "Addis Ababa",
    "zone": "Arada",
    "town": "Wereda 08",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-arada-wereda-09",
    "region": "Addis Ababa",
    "zone": "Arada",
    "town": "Wereda 09",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-arada-wereda-10",
    "region": "Addis Ababa",
    "zone": "Arada",
    "town": "Wereda 10",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-bole-wereda-01",
    "region": "Addis Ababa",
    "zone": "Bole",
    "town": "Wereda 01",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-bole-wereda-02",
    "region": "Addis Ababa",
    "zone": "Bole",
    "town": "Wereda 02",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-bole-wereda-03",
    "region": "Addis Ababa",
    "zone": "Bole",
    "town": "Wereda 03",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-bole-wereda-04",
    "region": "Addis Ababa",
    "zone": "Bole",
    "town": "Wereda 04",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-bole-wereda-05",
    "region": "Addis Ababa",
    "zone": "Bole",
    "town": "Wereda 05",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-bole-wereda-06",
    "region": "Addis Ababa",
    "zone": "Bole",
    "town": "Wereda 06",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-bole-wereda-07",
    "region": "Addis Ababa",
    "zone": "Bole",
    "town": "Wereda 07",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-bole-wereda-09",
    "region": "Addis Ababa",
    "zone": "Bole",
    "town": "Wereda 09",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-bole-wereda-11",
    "region": "Addis Ababa",
    "zone": "Bole",
    "town": "Wereda 11",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-bole-wereda-12",
    "region": "Addis Ababa",
    "zone": "Bole",
    "town": "Wereda 12",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-bole-wereda-13",
    "region": "Addis Ababa",
    "zone": "Bole",
    "town": "Wereda 13",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-bole-wereda-14",
    "region": "Addis Ababa",
    "zone": "Bole",
    "town": "Wereda 14",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-gulele-wereda-01",
    "region": "Addis Ababa",
    "zone": "Gulele",
    "town": "Wereda 01",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-gulele-wereda-02",
    "region": "Addis Ababa",
    "zone": "Gulele",
    "town": "Wereda 02",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-gulele-wereda-03",
    "region": "Addis Ababa",
    "zone": "Gulele",
    "town": "Wereda 03",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-gulele-wereda-04",
    "region": "Addis Ababa",
    "zone": "Gulele",
    "town": "Wereda 04",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-gulele-wereda-05",
    "region": "Addis Ababa",
    "zone": "Gulele",
    "town": "Wereda 05",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-gulele-wereda-06",
    "region": "Addis Ababa",
    "zone": "Gulele",
    "town": "Wereda 06",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-gulele-wereda-07",
    "region": "Addis Ababa",
    "zone": "Gulele",
    "town": "Wereda 07",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-gulele-wereda-08",
    "region": "Addis Ababa",
    "zone": "Gulele",
    "town": "Wereda 08",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-gulele-wereda-09",
    "region": "Addis Ababa",
    "zone": "Gulele",
    "town": "Wereda 09",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-gulele-wereda-10",
    "region": "Addis Ababa",
    "zone": "Gulele",
    "town": "Wereda 10",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-kerkos-wereda-01",
    "region": "Addis Ababa",
    "zone": "Kerkos",
    "town": "Wereda 01",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-kerkos-wereda-02",
    "region": "Addis Ababa",
    "zone": "Kerkos",
    "town": "Wereda 02",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-kerkos-wereda-03",
    "region": "Addis Ababa",
    "zone": "Kerkos",
    "town": "Wereda 03",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-kerkos-wereda-04",
    "region": "Addis Ababa",
    "zone": "Kerkos",
    "town": "Wereda 04",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-kerkos-wereda-05",
    "region": "Addis Ababa",
    "zone": "Kerkos",
    "town": "Wereda 05",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-kerkos-wereda-07",
    "region": "Addis Ababa",
    "zone": "Kerkos",
    "town": "Wereda 07",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-kerkos-wereda-08",
    "region": "Addis Ababa",
    "zone": "Kerkos",
    "town": "Wereda 08",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-kerkos-wereda-09",
    "region": "Addis Ababa",
    "zone": "Kerkos",
    "town": "Wereda 09",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-kerkos-wereda-10",
    "region": "Addis Ababa",
    "zone": "Kerkos",
    "town": "Wereda 10",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-kerkos-wereda-11",
    "region": "Addis Ababa",
    "zone": "Kerkos",
    "town": "Wereda 11",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-kolfe-keraniyo-wereda-01",
    "region": "Addis Ababa",
    "zone": "Kolfe Keraniyo",
    "town": "Wereda 01",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-kolfe-keraniyo-wereda-02",
    "region": "Addis Ababa",
    "zone": "Kolfe Keraniyo",
    "town": "Wereda 02",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-kolfe-keraniyo-wereda-03",
    "region": "Addis Ababa",
    "zone": "Kolfe Keraniyo",
    "town": "Wereda 03",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-kolfe-keraniyo-wereda-04",
    "region": "Addis Ababa",
    "zone": "Kolfe Keraniyo",
    "town": "Wereda 04",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-kolfe-keraniyo-wereda-05",
    "region": "Addis Ababa",
    "zone": "Kolfe Keraniyo",
    "town": "Wereda 05",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-kolfe-keraniyo-wereda-06",
    "region": "Addis Ababa",
    "zone": "Kolfe Keraniyo",
    "town": "Wereda 06",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-kolfe-keraniyo-wereda-07",
    "region": "Addis Ababa",
    "zone": "Kolfe Keraniyo",
    "town": "Wereda 07",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-kolfe-keraniyo-wereda-08",
    "region": "Addis Ababa",
    "zone": "Kolfe Keraniyo",
    "town": "Wereda 08",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-kolfe-keraniyo-wereda-09",
    "region": "Addis Ababa",
    "zone": "Kolfe Keraniyo",
    "town": "Wereda 09",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-kolfe-keraniyo-wereda-10",
    "region": "Addis Ababa",
    "zone": "Kolfe Keraniyo",
    "town": "Wereda 10",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-kolfe-keraniyo-wereda-11",
    "region": "Addis Ababa",
    "zone": "Kolfe Keraniyo",
    "town": "Wereda 11",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-lemi-kura-wereda-02",
    "region": "Addis Ababa",
    "zone": "Lemi kura",
    "town": "Wereda 02",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-lemi-kura-wereda-03",
    "region": "Addis Ababa",
    "zone": "Lemi kura",
    "town": "Wereda 03",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-lemi-kura-wereda-04",
    "region": "Addis Ababa",
    "zone": "Lemi kura",
    "town": "Wereda 04",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-lemi-kura-wereda-05",
    "region": "Addis Ababa",
    "zone": "Lemi kura",
    "town": "Wereda 05",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-lemi-kura-wereda-06",
    "region": "Addis Ababa",
    "zone": "Lemi kura",
    "town": "Wereda 06",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-lemi-kura-wereda-08",
    "region": "Addis Ababa",
    "zone": "Lemi kura",
    "town": "Wereda 08",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-lemi-kura-wereda-09",
    "region": "Addis Ababa",
    "zone": "Lemi kura",
    "town": "Wereda 09",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-lemi-kura-wereda-10",
    "region": "Addis Ababa",
    "zone": "Lemi kura",
    "town": "Wereda 10",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-lemi-kura-wereda-13",
    "region": "Addis Ababa",
    "zone": "Lemi kura",
    "town": "Wereda 13",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-lemi-kura-wereda-14",
    "region": "Addis Ababa",
    "zone": "Lemi kura",
    "town": "Wereda 14",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-lideta-wereda-01",
    "region": "Addis Ababa",
    "zone": "Lideta",
    "town": "Wereda 01",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-lideta-wereda-02",
    "region": "Addis Ababa",
    "zone": "Lideta",
    "town": "Wereda 02",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-lideta-wereda-03",
    "region": "Addis Ababa",
    "zone": "Lideta",
    "town": "Wereda 03",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-lideta-wereda-04",
    "region": "Addis Ababa",
    "zone": "Lideta",
    "town": "Wereda 04",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-lideta-wereda-05",
    "region": "Addis Ababa",
    "zone": "Lideta",
    "town": "Wereda 05",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-lideta-wereda-06",
    "region": "Addis Ababa",
    "zone": "Lideta",
    "town": "Wereda 06",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-lideta-wereda-07",
    "region": "Addis Ababa",
    "zone": "Lideta",
    "town": "Wereda 07",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-lideta-wereda-08",
    "region": "Addis Ababa",
    "zone": "Lideta",
    "town": "Wereda 08",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-lideta-wereda-09",
    "region": "Addis Ababa",
    "zone": "Lideta",
    "town": "Wereda 09",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-lideta-wereda-10",
    "region": "Addis Ababa",
    "zone": "Lideta",
    "town": "Wereda 10",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-nifas-slik-lafto-wereda-01",
    "region": "Addis Ababa",
    "zone": "Nifas Slik Lafto",
    "town": "Wereda 01",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-nifas-slik-lafto-wereda-02",
    "region": "Addis Ababa",
    "zone": "Nifas Slik Lafto",
    "town": "Wereda 02",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-nifas-slik-lafto-wereda-05",
    "region": "Addis Ababa",
    "zone": "Nifas Slik Lafto",
    "town": "Wereda 05",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-nifas-slik-lafto-wereda-06",
    "region": "Addis Ababa",
    "zone": "Nifas Slik Lafto",
    "town": "Wereda 06",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-nifas-slik-lafto-wereda-07",
    "region": "Addis Ababa",
    "zone": "Nifas Slik Lafto",
    "town": "Wereda 07",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-nifas-slik-lafto-wereda-08",
    "region": "Addis Ababa",
    "zone": "Nifas Slik Lafto",
    "town": "Wereda 08",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-nifas-slik-lafto-wereda-09",
    "region": "Addis Ababa",
    "zone": "Nifas Slik Lafto",
    "town": "Wereda 09",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-nifas-slik-lafto-wereda-10",
    "region": "Addis Ababa",
    "zone": "Nifas Slik Lafto",
    "town": "Wereda 10",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-nifas-slik-lafto-wereda-11",
    "region": "Addis Ababa",
    "zone": "Nifas Slik Lafto",
    "town": "Wereda 11",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-nifas-slik-lafto-wereda-12",
    "region": "Addis Ababa",
    "zone": "Nifas Slik Lafto",
    "town": "Wereda 12",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-nifas-slik-lafto-wereda-13",
    "region": "Addis Ababa",
    "zone": "Nifas Slik Lafto",
    "town": "Wereda 13",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-nifas-slik-lafto-wereda-15",
    "region": "Addis Ababa",
    "zone": "Nifas Slik Lafto",
    "town": "Wereda 15",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-yeka-wereda-01",
    "region": "Addis Ababa",
    "zone": "Yeka",
    "town": "Wereda 01",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-yeka-wereda-02",
    "region": "Addis Ababa",
    "zone": "Yeka",
    "town": "Wereda 02",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-yeka-wereda-03",
    "region": "Addis Ababa",
    "zone": "Yeka",
    "town": "Wereda 03",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-yeka-wereda-04",
    "region": "Addis Ababa",
    "zone": "Yeka",
    "town": "Wereda 04",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-yeka-wereda-05",
    "region": "Addis Ababa",
    "zone": "Yeka",
    "town": "Wereda 05",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-yeka-wereda-06",
    "region": "Addis Ababa",
    "zone": "Yeka",
    "town": "Wereda 06",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-yeka-wereda-07",
    "region": "Addis Ababa",
    "zone": "Yeka",
    "town": "Wereda 07",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-yeka-wereda-08",
    "region": "Addis Ababa",
    "zone": "Yeka",
    "town": "Wereda 08",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-yeka-wereda-09",
    "region": "Addis Ababa",
    "zone": "Yeka",
    "town": "Wereda 09",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-yeka-wereda-10",
    "region": "Addis Ababa",
    "zone": "Yeka",
    "town": "Wereda 10",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-yeka-wereda-11",
    "region": "Addis Ababa",
    "zone": "Yeka",
    "town": "Wereda 11",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-addis-ababa-yeka-wereda-12",
    "region": "Addis Ababa",
    "zone": "Yeka",
    "town": "Wereda 12",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-afar-zone-1-awsiresu-adear",
    "region": "Afar",
    "zone": "Zone_1(Awsiresu)",
    "town": "Adear",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-afar-zone-1-awsiresu-afambo",
    "region": "Afar",
    "zone": "Zone_1(Awsiresu)",
    "town": "Afambo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-afar-zone-1-awsiresu-aysaita-ketema-astedader",
    "region": "Afar",
    "zone": "Zone_1(Awsiresu)",
    "town": "Aysaita Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-afar-zone-1-awsiresu-aysayita",
    "region": "Afar",
    "zone": "Zone_1(Awsiresu)",
    "town": "Aysayita",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-afar-zone-1-awsiresu-chifra",
    "region": "Afar",
    "zone": "Zone_1(Awsiresu)",
    "town": "Chifra",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-afar-zone-1-awsiresu-dubti",
    "region": "Afar",
    "zone": "Zone_1(Awsiresu)",
    "town": "Dubti",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-afar-zone-1-awsiresu-dubti-ketema-astedader",
    "region": "Afar",
    "zone": "Zone_1(Awsiresu)",
    "town": "Dubti Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-afar-zone-1-awsiresu-elidar",
    "region": "Afar",
    "zone": "Zone_1(Awsiresu)",
    "town": "Elidar",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-afar-zone-1-awsiresu-geyreni",
    "region": "Afar",
    "zone": "Zone_1(Awsiresu)",
    "town": "Geyreni",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-afar-zone-1-awsiresu-kori",
    "region": "Afar",
    "zone": "Zone_1(Awsiresu)",
    "town": "Kori",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-afar-zone-1-awsiresu-mile",
    "region": "Afar",
    "zone": "Zone_1(Awsiresu)",
    "town": "Mile",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-afar-zone-2-kelbetiresu-abala-ketema-astedader",
    "region": "Afar",
    "zone": "Zone_2 (Kelbetiresu)",
    "town": "Abala Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-afar-zone-2-kelbetiresu-abeala",
    "region": "Afar",
    "zone": "Zone_2 (Kelbetiresu)",
    "town": "Abeala",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-afar-zone-2-kelbetiresu-afdera",
    "region": "Afar",
    "zone": "Zone_2 (Kelbetiresu)",
    "town": "Afdera",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-afar-zone-2-kelbetiresu-berehale",
    "region": "Afar",
    "zone": "Zone_2 (Kelbetiresu)",
    "town": "Berehale",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-afar-zone-2-kelbetiresu-bidu",
    "region": "Afar",
    "zone": "Zone_2 (Kelbetiresu)",
    "town": "Bidu",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-afar-zone-2-kelbetiresu-dalol",
    "region": "Afar",
    "zone": "Zone_2 (Kelbetiresu)",
    "town": "Dalol",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-afar-zone-2-kelbetiresu-erebti",
    "region": "Afar",
    "zone": "Zone_2 (Kelbetiresu)",
    "town": "Erebti",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-afar-zone-2-kelbetiresu-kuneba",
    "region": "Afar",
    "zone": "Zone_2 (Kelbetiresu)",
    "town": "Kuneba",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-afar-zone-2-kelbetiresu-megale",
    "region": "Afar",
    "zone": "Zone_2 (Kelbetiresu)",
    "town": "Megale",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-afar-zone-3-gebiresu-amibara",
    "region": "Afar",
    "zone": "Zone_3 (Gebiresu)",
    "town": "Amibara",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-afar-zone-3-gebiresu-argoba-liyu",
    "region": "Afar",
    "zone": "Zone_3 (Gebiresu)",
    "town": "Argoba Liyu",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-afar-zone-3-gebiresu-awash-fentale",
    "region": "Afar",
    "zone": "Zone_3 (Gebiresu)",
    "town": "Awash Fentale",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-afar-zone-3-gebiresu-awash-ketema-astedader",
    "region": "Afar",
    "zone": "Zone_3 (Gebiresu)",
    "town": "Awash Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-afar-zone-3-gebiresu-dulesa",
    "region": "Afar",
    "zone": "Zone_3 (Gebiresu)",
    "town": "Dulesa",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-afar-zone-3-gebiresu-gelalo",
    "region": "Afar",
    "zone": "Zone_3 (Gebiresu)",
    "town": "Gelalo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-afar-zone-3-gebiresu-gewane",
    "region": "Afar",
    "zone": "Zone_3 (Gebiresu)",
    "town": "Gewane",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-afar-zone-4-fentiresu-awra",
    "region": "Afar",
    "zone": "Zone_4 (Fentiresu)",
    "town": "Awra",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-afar-zone-4-fentiresu-ewa",
    "region": "Afar",
    "zone": "Zone_4 (Fentiresu)",
    "town": "Ewa",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-afar-zone-4-fentiresu-golina",
    "region": "Afar",
    "zone": "Zone_4 (Fentiresu)",
    "town": "Golina",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-afar-zone-4-fentiresu-teru",
    "region": "Afar",
    "zone": "Zone_4 (Fentiresu)",
    "town": "Teru",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-afar-zone-4-fentiresu-yalo",
    "region": "Afar",
    "zone": "Zone_4 (Fentiresu)",
    "town": "Yalo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-afar-zone-5-hari-resu-dalifage",
    "region": "Afar",
    "zone": "Zone_5 (Hari Resu)",
    "town": "Dalifage",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-afar-zone-5-hari-resu-dewe",
    "region": "Afar",
    "zone": "Zone_5 (Hari Resu)",
    "town": "Dewe",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-afar-zone-5-hari-resu-hadele-ela",
    "region": "Afar",
    "zone": "Zone_5 (Hari Resu)",
    "town": "Hadele'ela",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-afar-zone-5-hari-resu-semurobi",
    "region": "Afar",
    "zone": "Zone_5 (Hari Resu)",
    "town": "Semurobi",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-afar-zone-5-hari-resu-telalak",
    "region": "Afar",
    "zone": "Zone_5 (Hari Resu)",
    "town": "Telalak",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-afar-zone-6-logia-semera",
    "region": "Afar",
    "zone": "Zone_6",
    "town": "Logia Semera",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-awi-ankesha-guagusa",
    "region": "Amhara",
    "zone": "Awi",
    "town": "Ankesha Guagusa",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-awi-ayehu-guagusa",
    "region": "Amhara",
    "zone": "Awi",
    "town": "Ayehu Guagusa",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-awi-banja-shigudad",
    "region": "Amhara",
    "zone": "Awi",
    "town": "Banja Shigudad",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-awi-chagini",
    "region": "Amhara",
    "zone": "Awi",
    "town": "Chagini",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-awi-dangila",
    "region": "Amhara",
    "zone": "Awi",
    "town": "Dangila",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-awi-dangla-ketema-astedader",
    "region": "Amhara",
    "zone": "Awi",
    "town": "Dangla Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-awi-enjibara-ketema-astedader",
    "region": "Amhara",
    "zone": "Awi",
    "town": "Enjibara Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-awi-fagita-lekoma",
    "region": "Amhara",
    "zone": "Awi",
    "town": "Fagita Lekoma",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-awi-guagusashekudad",
    "region": "Amhara",
    "zone": "Awi",
    "town": "Guagusashekudad",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-awi-guangua",
    "region": "Amhara",
    "zone": "Awi",
    "town": "Guangua",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-awi-jawi",
    "region": "Amhara",
    "zone": "Awi",
    "town": "Jawi",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-awi-zigem",
    "region": "Amhara",
    "zone": "Awi",
    "town": "Zigem",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-bahir-dar-liyu-bahir-dar-ketema-zuria",
    "region": "Amhara",
    "zone": "Bahir Dar Liyu",
    "town": "Bahir Dar Ketema Zuria",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-bahir-dar-liyu-bahirdar-ketema-geter-and-tana",
    "region": "Amhara",
    "zone": "Bahir Dar Liyu",
    "town": "Bahirdar Ketema /Geter/ and Tana",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-bahir-dar-liyu-belay-zeleke",
    "region": "Amhara",
    "zone": "Bahir Dar Liyu",
    "town": "Belay Zeleke",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-bahir-dar-liyu-fasilo",
    "region": "Amhara",
    "zone": "Bahir Dar Liyu",
    "town": "Fasilo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-bahir-dar-liyu-ginbot-20",
    "region": "Amhara",
    "zone": "Bahir Dar Liyu",
    "town": "Ginbot 20",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-bahir-dar-liyu-gishe-abay",
    "region": "Amhara",
    "zone": "Bahir Dar Liyu",
    "town": "Gishe Abay",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-bahir-dar-liyu-hidar-11",
    "region": "Amhara",
    "zone": "Bahir Dar Liyu",
    "town": "Hidar 11",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-debub-gonder-addis-zemen",
    "region": "Amhara",
    "zone": "Debub Gonder",
    "town": "Addis Zemen",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-debub-gonder-andabet",
    "region": "Amhara",
    "zone": "Debub Gonder",
    "town": "Andabet",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-debub-gonder-debre-tabor",
    "region": "Amhara",
    "zone": "Debub Gonder",
    "town": "Debre Tabor",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-debub-gonder-dera",
    "region": "Amhara",
    "zone": "Debub Gonder",
    "town": "Dera",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-debub-gonder-ebinat",
    "region": "Amhara",
    "zone": "Debub Gonder",
    "town": "Ebinat",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-debub-gonder-estie",
    "region": "Amhara",
    "zone": "Debub Gonder",
    "town": "Estie",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-debub-gonder-farta",
    "region": "Amhara",
    "zone": "Debub Gonder",
    "town": "Farta",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-debub-gonder-fogera",
    "region": "Amhara",
    "zone": "Debub Gonder",
    "town": "Fogera",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-debub-gonder-guna-begie-midir",
    "region": "Amhara",
    "zone": "Debub Gonder",
    "town": "Guna Begie Midir",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-debub-gonder-lay-gayint",
    "region": "Amhara",
    "zone": "Debub Gonder",
    "town": "Lay Gayint",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-debub-gonder-libokemkem",
    "region": "Amhara",
    "zone": "Debub Gonder",
    "town": "Libokemkem",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-debub-gonder-mekane-eyesus",
    "region": "Amhara",
    "zone": "Debub Gonder",
    "town": "Mekane Eyesus",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-debub-gonder-meketewa",
    "region": "Amhara",
    "zone": "Debub Gonder",
    "town": "Meketewa",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-debub-gonder-nifas-mewcha",
    "region": "Amhara",
    "zone": "Debub Gonder",
    "town": "Nifas Mewcha",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-debub-gonder-sedie-muja",
    "region": "Amhara",
    "zone": "Debub Gonder",
    "town": "Sedie Muja",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-debub-gonder-simada",
    "region": "Amhara",
    "zone": "Debub Gonder",
    "town": "Simada",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-debub-gonder-tachgayint",
    "region": "Amhara",
    "zone": "Debub Gonder",
    "town": "Tachgayint",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-debub-gonder-woreta",
    "region": "Amhara",
    "zone": "Debub Gonder",
    "town": "Woreta",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-debub-wello-albuko",
    "region": "Amhara",
    "zone": "Debub Wello",
    "town": "Albuko",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-debub-wello-ambasel",
    "region": "Amhara",
    "zone": "Debub Wello",
    "town": "Ambasel",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-debub-wello-argoba-liyu",
    "region": "Amhara",
    "zone": "Debub Wello",
    "town": "Argoba Liyu",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-debub-wello-borena",
    "region": "Amhara",
    "zone": "Debub Wello",
    "town": "Borena",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-debub-wello-delanta",
    "region": "Amhara",
    "zone": "Debub Wello",
    "town": "Delanta",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-debub-wello-dessie-zuriya",
    "region": "Amhara",
    "zone": "Debub Wello",
    "town": "Dessie Zuriya",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-debub-wello-haik",
    "region": "Amhara",
    "zone": "Debub Wello",
    "town": "Haik",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-debub-wello-jama",
    "region": "Amhara",
    "zone": "Debub Wello",
    "town": "Jama",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-debub-wello-kalu",
    "region": "Amhara",
    "zone": "Debub Wello",
    "town": "Kalu",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-debub-wello-kelala",
    "region": "Amhara",
    "zone": "Debub Wello",
    "town": "Kelala",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-debub-wello-kombolcha-ketema-astedader",
    "region": "Amhara",
    "zone": "Debub Wello",
    "town": "Kombolcha Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-debub-wello-kutaber",
    "region": "Amhara",
    "zone": "Debub Wello",
    "town": "Kutaber",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-debub-wello-legambo",
    "region": "Amhara",
    "zone": "Debub Wello",
    "town": "Legambo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-debub-wello-legehida",
    "region": "Amhara",
    "zone": "Debub Wello",
    "town": "Legehida",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-debub-wello-mehal-sayint",
    "region": "Amhara",
    "zone": "Debub Wello",
    "town": "Mehal Sayint",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-debub-wello-mekane-selam-ketema-astedader",
    "region": "Amhara",
    "zone": "Debub Wello",
    "town": "Mekane Selam Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-debub-wello-mekdela",
    "region": "Amhara",
    "zone": "Debub Wello",
    "town": "Mekdela",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-debub-wello-saynt-adjibar",
    "region": "Amhara",
    "zone": "Debub Wello",
    "town": "Saynt Adjibar",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-debub-wello-tehuledere",
    "region": "Amhara",
    "zone": "Debub Wello",
    "town": "Tehuledere",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-debub-wello-teneta",
    "region": "Amhara",
    "zone": "Debub Wello",
    "town": "Teneta",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-debub-wello-werebabo",
    "region": "Amhara",
    "zone": "Debub Wello",
    "town": "Werebabo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-debub-wello-wereilu",
    "region": "Amhara",
    "zone": "Debub Wello",
    "town": "Wereilu",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-debub-wello-wereilu-ketema-astedader",
    "region": "Amhara",
    "zone": "Debub Wello",
    "town": "Wereilu Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-debub-wello-wogdie",
    "region": "Amhara",
    "zone": "Debub Wello",
    "town": "Wogdie",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-dessie-town-administration-arada",
    "region": "Amhara",
    "zone": "Dessie Town Administration",
    "town": "Arada",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-dessie-town-administration-banbawuha",
    "region": "Amhara",
    "zone": "Dessie Town Administration",
    "town": "Banbawuha",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-dessie-town-administration-dessie-ketema-geter-and-menafesha",
    "region": "Amhara",
    "zone": "Dessie Town Administration",
    "town": "Dessie Ketema /Geter/ and Menafesha",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-dessie-town-administration-hote",
    "region": "Amhara",
    "zone": "Dessie Town Administration",
    "town": "Hote",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-dessie-town-administration-segnogebeya",
    "region": "Amhara",
    "zone": "Dessie Town Administration",
    "town": "Segnogebeya",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-gondar-ketema-liyu-arada",
    "region": "Amhara",
    "zone": "Gondar Ketema Liyu",
    "town": "Arada",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-gondar-ketema-liyu-azezo-tseda",
    "region": "Amhara",
    "zone": "Gondar Ketema Liyu",
    "town": "Azezo Tseda",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-gondar-ketema-liyu-fasil",
    "region": "Amhara",
    "zone": "Gondar Ketema Liyu",
    "town": "Fasil",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-gondar-ketema-liyu-gondar-ketama-geter-and-zobel",
    "region": "Amhara",
    "zone": "Gondar Ketema Liyu",
    "town": "Gondar Ketama /Geter/ and Zobel",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-gondar-ketema-liyu-jantekel",
    "region": "Amhara",
    "zone": "Gondar Ketema Liyu",
    "town": "Jantekel",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-gondar-ketema-liyu-maraki",
    "region": "Amhara",
    "zone": "Gondar Ketema Liyu",
    "town": "Maraki",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-maekelawi-gonder-alefa",
    "region": "Amhara",
    "zone": "Maekelawi Gonder",
    "town": "Alefa",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-maekelawi-gonder-aykel-ketema-astedader",
    "region": "Amhara",
    "zone": "Maekelawi Gonder",
    "town": "Aykel Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-maekelawi-gonder-chilga",
    "region": "Amhara",
    "zone": "Maekelawi Gonder",
    "town": "Chilga",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-maekelawi-gonder-gonder-zuriya",
    "region": "Amhara",
    "zone": "Maekelawi Gonder",
    "town": "Gonder Zuriya",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-maekelawi-gonder-kinfaz-begela",
    "region": "Amhara",
    "zone": "Maekelawi Gonder",
    "town": "Kinfaz Begela",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-maekelawi-gonder-lay-armachiho",
    "region": "Amhara",
    "zone": "Maekelawi Gonder",
    "town": "Lay Armachiho",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-maekelawi-gonder-mirabbelesa",
    "region": "Amhara",
    "zone": "Maekelawi Gonder",
    "town": "Mirabbelesa",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-maekelawi-gonder-mirabdembiya",
    "region": "Amhara",
    "zone": "Maekelawi Gonder",
    "town": "Mirabdembiya",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-maekelawi-gonder-misrak-belesa",
    "region": "Amhara",
    "zone": "Maekelawi Gonder",
    "town": "Misrak Belesa",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-maekelawi-gonder-misrak-dembiya",
    "region": "Amhara",
    "zone": "Maekelawi Gonder",
    "town": "Misrak Dembiya",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-maekelawi-gonder-tachi-armachiho",
    "region": "Amhara",
    "zone": "Maekelawi Gonder",
    "town": "Tachi Armachiho",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-maekelawi-gonder-takusa",
    "region": "Amhara",
    "zone": "Maekelawi Gonder",
    "town": "Takusa",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-maekelawi-gonder-tegedie",
    "region": "Amhara",
    "zone": "Maekelawi Gonder",
    "town": "Tegedie",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-maekelawi-gonder-wogera",
    "region": "Amhara",
    "zone": "Maekelawi Gonder",
    "town": "Wogera",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-mirab-gojjam-burie-ketema-astedader",
    "region": "Amhara",
    "zone": "Mirab Gojjam",
    "town": "Burie Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-mirab-gojjam-burie-zuria",
    "region": "Amhara",
    "zone": "Mirab Gojjam",
    "town": "Burie Zuria",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-mirab-gojjam-dega-damot",
    "region": "Amhara",
    "zone": "Mirab Gojjam",
    "town": "Dega Damot",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-mirab-gojjam-dembecha",
    "region": "Amhara",
    "zone": "Mirab Gojjam",
    "town": "Dembecha",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-mirab-gojjam-dembecha-ketema-astedader",
    "region": "Amhara",
    "zone": "Mirab Gojjam",
    "town": "Dembecha Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-mirab-gojjam-finoteselam-ketema-astedader",
    "region": "Amhara",
    "zone": "Mirab Gojjam",
    "town": "Finoteselam Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-mirab-gojjam-jebitehnan",
    "region": "Amhara",
    "zone": "Mirab Gojjam",
    "town": "Jebitehnan",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-mirab-gojjam-quarit",
    "region": "Amhara",
    "zone": "Mirab Gojjam",
    "town": "Quarit",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-mirab-gojjam-sekela",
    "region": "Amhara",
    "zone": "Mirab Gojjam",
    "town": "Sekela",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-mirab-gojjam-womberma",
    "region": "Amhara",
    "zone": "Mirab Gojjam",
    "town": "Womberma",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-mirab-gonder-gendewuha-ketema",
    "region": "Amhara",
    "zone": "Mirab Gonder",
    "town": "Gendewuha Ketema",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-mirab-gonder-merab-armachiho",
    "region": "Amhara",
    "zone": "Mirab Gonder",
    "town": "Merab Armachiho",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-mirab-gonder-metema",
    "region": "Amhara",
    "zone": "Mirab Gonder",
    "town": "Metema",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-mirab-gonder-metema-yohannes-ketema-astedader",
    "region": "Amhara",
    "zone": "Mirab Gonder",
    "town": "Metema Yohannes Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-mirab-gonder-midre-genet-ketema-astedader",
    "region": "Amhara",
    "zone": "Mirab Gonder",
    "town": "Midre Genet Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-mirab-gonder-quara",
    "region": "Amhara",
    "zone": "Mirab Gonder",
    "town": "Quara",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-misrak-gojjam-aneded",
    "region": "Amhara",
    "zone": "Misrak Gojjam",
    "town": "Aneded",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-misrak-gojjam-awabel",
    "region": "Amhara",
    "zone": "Misrak Gojjam",
    "town": "Awabel",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-misrak-gojjam-baso-liben",
    "region": "Amhara",
    "zone": "Misrak Gojjam",
    "town": "Baso_liben",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-misrak-gojjam-bibugn",
    "region": "Amhara",
    "zone": "Misrak Gojjam",
    "town": "Bibugn",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-misrak-gojjam-bichena-ketema-astedader",
    "region": "Amhara",
    "zone": "Misrak Gojjam",
    "town": "Bichena Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-misrak-gojjam-debay-tilat-gin",
    "region": "Amhara",
    "zone": "Misrak Gojjam",
    "town": "Debay Tilat Gin",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-misrak-gojjam-debre-elias",
    "region": "Amhara",
    "zone": "Misrak Gojjam",
    "town": "Debre Elias",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-misrak-gojjam-debre-markos",
    "region": "Amhara",
    "zone": "Misrak Gojjam",
    "town": "Debre Markos",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-misrak-gojjam-dejen",
    "region": "Amhara",
    "zone": "Misrak Gojjam",
    "town": "Dejen",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-misrak-gojjam-dejen-ketema-astedader",
    "region": "Amhara",
    "zone": "Misrak Gojjam",
    "town": "Dejen Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-misrak-gojjam-enarji-ena-enawuga",
    "region": "Amhara",
    "zone": "Misrak Gojjam",
    "town": "Enarji Ena Enawuga",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-misrak-gojjam-enebsie-sar-midir",
    "region": "Amhara",
    "zone": "Misrak Gojjam",
    "town": "Enebsie Sar Midir",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-misrak-gojjam-enemay",
    "region": "Amhara",
    "zone": "Misrak Gojjam",
    "town": "Enemay",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-misrak-gojjam-goncha-siso-enese",
    "region": "Amhara",
    "zone": "Misrak Gojjam",
    "town": "Goncha Siso Enese",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-misrak-gojjam-gozamen",
    "region": "Amhara",
    "zone": "Misrak Gojjam",
    "town": "Gozamen",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-misrak-gojjam-hulet-eju-enese",
    "region": "Amhara",
    "zone": "Misrak Gojjam",
    "town": "Hulet Eju Enese",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-misrak-gojjam-machakel",
    "region": "Amhara",
    "zone": "Misrak Gojjam",
    "town": "Machakel",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-misrak-gojjam-mota-ketema-astedader",
    "region": "Amhara",
    "zone": "Misrak Gojjam",
    "town": "Mota Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-misrak-gojjam-sede",
    "region": "Amhara",
    "zone": "Misrak Gojjam",
    "town": "Sede",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-misrak-gojjam-shebel-berenta",
    "region": "Amhara",
    "zone": "Misrak Gojjam",
    "town": "Shebel Berenta",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-misrak-gojjam-sinan",
    "region": "Amhara",
    "zone": "Misrak Gojjam",
    "town": "Sinan",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-oromiya-liyu-arituma-fursi",
    "region": "Amhara",
    "zone": "Oromiya Liyu",
    "town": "Arituma Fursi",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-oromiya-liyu-bati",
    "region": "Amhara",
    "zone": "Oromiya Liyu",
    "town": "Bati",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-oromiya-liyu-bati-ketema-astedader",
    "region": "Amhara",
    "zone": "Oromiya Liyu",
    "town": "Bati Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-oromiya-liyu-dewa-chefa",
    "region": "Amhara",
    "zone": "Oromiya Liyu",
    "town": "Dewa Chefa",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-oromiya-liyu-dewe-harawa",
    "region": "Amhara",
    "zone": "Oromiya Liyu",
    "town": "Dewe Harawa",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-oromiya-liyu-jile-timuga",
    "region": "Amhara",
    "zone": "Oromiya Liyu",
    "town": "Jile Timuga",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-oromiya-liyu-kemisse",
    "region": "Amhara",
    "zone": "Oromiya Liyu",
    "town": "Kemisse",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-ras-dashen-terara-biherawi-paark-ras-dashen-terara-biherawi-paark",
    "region": "Amhara",
    "zone": "Ras Dashen Terara Biherawi Paark",
    "town": "Ras Dashen Terara Biherawi Paark",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-gojjam-adet-town-administration",
    "region": "Amhara",
    "zone": "Semen Gojjam",
    "town": "Adet Town Administration",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-gojjam-bahirdar-zuriya",
    "region": "Amhara",
    "zone": "Semen Gojjam",
    "town": "Bahirdar Zuriya",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-gojjam-debub-achefer",
    "region": "Amhara",
    "zone": "Semen Gojjam",
    "town": "Debub Achefer",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-gojjam-debub-mecha",
    "region": "Amhara",
    "zone": "Semen Gojjam",
    "town": "Debub Mecha",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-gojjam-durbete-ketema-astedader",
    "region": "Amhara",
    "zone": "Semen Gojjam",
    "town": "Durbete Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-gojjam-gonje-kolela",
    "region": "Amhara",
    "zone": "Semen Gojjam",
    "town": "Gonje Kolela",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-gojjam-merawi-ketema-astedader",
    "region": "Amhara",
    "zone": "Semen Gojjam",
    "town": "Merawi Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-gojjam-semen-achefer",
    "region": "Amhara",
    "zone": "Semen Gojjam",
    "town": "Semen Achefer",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-gojjam-semen-mecha",
    "region": "Amhara",
    "zone": "Semen Gojjam",
    "town": "Semen Mecha",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-gojjam-yilmana-densa",
    "region": "Amhara",
    "zone": "Semen Gojjam",
    "town": "Yilmana Densa",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-gonder-adi-arkay",
    "region": "Amhara",
    "zone": "Semen Gonder",
    "town": "Adi Arkay",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-gonder-beyeda",
    "region": "Amhara",
    "zone": "Semen Gonder",
    "town": "Beyeda",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-gonder-dabat",
    "region": "Amhara",
    "zone": "Semen Gonder",
    "town": "Dabat",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-gonder-dabat-ketema-astedader",
    "region": "Amhara",
    "zone": "Semen Gonder",
    "town": "Dabat Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-gonder-debark",
    "region": "Amhara",
    "zone": "Semen Gonder",
    "town": "Debark",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-gonder-debark-city-administration",
    "region": "Amhara",
    "zone": "Semen Gonder",
    "town": "Debark City Administration",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-gonder-janamora",
    "region": "Amhara",
    "zone": "Semen Gonder",
    "town": "Janamora",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-gonder-telemit",
    "region": "Amhara",
    "zone": "Semen Gonder",
    "town": "Telemit",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-shewa-alemketema-town-administration",
    "region": "Amhara",
    "zone": "Semen Shewa",
    "town": "Alemketema Town Administration",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-shewa-angolelanatera",
    "region": "Amhara",
    "zone": "Semen Shewa",
    "town": "Angolelanatera",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-shewa-ankober",
    "region": "Amhara",
    "zone": "Semen Shewa",
    "town": "Ankober",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-shewa-antsokia-gemza",
    "region": "Amhara",
    "zone": "Semen Shewa",
    "town": "Antsokia Gemza",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-shewa-arerti-town-administration",
    "region": "Amhara",
    "zone": "Semen Shewa",
    "town": "Arerti Town Administration",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-shewa-asagrt",
    "region": "Amhara",
    "zone": "Semen Shewa",
    "town": "Asagrt",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-shewa-ataye-town-administration",
    "region": "Amhara",
    "zone": "Semen Shewa",
    "town": "Ataye Town Administration",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-shewa-basso-ena-werena",
    "region": "Amhara",
    "zone": "Semen Shewa",
    "town": "Basso Ena Werena",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-shewa-berehet",
    "region": "Amhara",
    "zone": "Semen Shewa",
    "town": "Berehet",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-shewa-bulga-town-administration",
    "region": "Amhara",
    "zone": "Semen Shewa",
    "town": "Bulga Town Administration",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-shewa-debre-birhan",
    "region": "Amhara",
    "zone": "Semen Shewa",
    "town": "Debre Birhan",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-shewa-debre-sina-town-administration",
    "region": "Amhara",
    "zone": "Semen Shewa",
    "town": "Debre sina Town Administration",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-shewa-eenewari-town-administration",
    "region": "Amhara",
    "zone": "Semen Shewa",
    "town": "Eenewari Town Administration",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-shewa-efratana-gidim",
    "region": "Amhara",
    "zone": "Semen Shewa",
    "town": "Efratana Gidim",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-shewa-ensaro",
    "region": "Amhara",
    "zone": "Semen Shewa",
    "town": "Ensaro",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-shewa-geshe",
    "region": "Amhara",
    "zone": "Semen Shewa",
    "town": "Geshe",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-shewa-hagere-maryam-kesem",
    "region": "Amhara",
    "zone": "Semen Shewa",
    "town": "Hagere Maryam Kesem",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-shewa-kewot",
    "region": "Amhara",
    "zone": "Semen Shewa",
    "town": "Kewot",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-shewa-mehalmeda",
    "region": "Amhara",
    "zone": "Semen Shewa",
    "town": "Mehalmeda",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-shewa-menz-gera-midere",
    "region": "Amhara",
    "zone": "Semen Shewa",
    "town": "Menz Gera Midere",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-shewa-menz-keya-gebrael",
    "region": "Amhara",
    "zone": "Semen Shewa",
    "town": "Menz Keya Gebrael",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-shewa-menz-mama-midir",
    "region": "Amhara",
    "zone": "Semen Shewa",
    "town": "Menz Mama Midir",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-shewa-menzlalo",
    "region": "Amhara",
    "zone": "Semen Shewa",
    "town": "Menzlalo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-shewa-merehabetie",
    "region": "Amhara",
    "zone": "Semen Shewa",
    "town": "Merehabetie",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-shewa-mida-woremo",
    "region": "Amhara",
    "zone": "Semen Shewa",
    "town": "Mida Woremo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-shewa-minjar-shonkora",
    "region": "Amhara",
    "zone": "Semen Shewa",
    "town": "Minjar Shonkora",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-shewa-mojana-wedera",
    "region": "Amhara",
    "zone": "Semen Shewa",
    "town": "Mojana Wedera",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-shewa-molale-town-administration",
    "region": "Amhara",
    "zone": "Semen Shewa",
    "town": "Molale Town Administration",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-shewa-moretna-jiru",
    "region": "Amhara",
    "zone": "Semen Shewa",
    "town": "Moretna Jiru",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-shewa-saya-debirna-wayu",
    "region": "Amhara",
    "zone": "Semen Shewa",
    "town": "Saya Debirna Wayu",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-shewa-shewarobit-town-administration",
    "region": "Amhara",
    "zone": "Semen Shewa",
    "town": "Shewarobit Town Administration",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-shewa-tarmaber",
    "region": "Amhara",
    "zone": "Semen Shewa",
    "town": "Tarmaber",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-wello-angot",
    "region": "Amhara",
    "zone": "Semen Wello",
    "town": "Angot",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-wello-bugna",
    "region": "Amhara",
    "zone": "Semen Wello",
    "town": "Bugna",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-wello-dawunt",
    "region": "Amhara",
    "zone": "Semen Wello",
    "town": "Dawunt",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-wello-gazo",
    "region": "Amhara",
    "zone": "Semen Wello",
    "town": "Gazo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-wello-gidan",
    "region": "Amhara",
    "zone": "Semen Wello",
    "town": "Gidan",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-wello-gubalafto",
    "region": "Amhara",
    "zone": "Semen Wello",
    "town": "Gubalafto",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-wello-habiru",
    "region": "Amhara",
    "zone": "Semen Wello",
    "town": "Habiru",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-wello-kobo-ketema",
    "region": "Amhara",
    "zone": "Semen Wello",
    "town": "Kobo Ketema",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-wello-lalibela-ketema-astedader",
    "region": "Amhara",
    "zone": "Semen Wello",
    "town": "Lalibela Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-wello-lasta",
    "region": "Amhara",
    "zone": "Semen Wello",
    "town": "Lasta",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-wello-meket",
    "region": "Amhara",
    "zone": "Semen Wello",
    "town": "Meket",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-wello-mersa-ketema-astedader",
    "region": "Amhara",
    "zone": "Semen Wello",
    "town": "Mersa Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-wello-raya-kobo",
    "region": "Amhara",
    "zone": "Semen Wello",
    "town": "Raya Kobo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-wello-wadila",
    "region": "Amhara",
    "zone": "Semen Wello",
    "town": "Wadila",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-semen-wello-weldiya-ketema-astedader",
    "region": "Amhara",
    "zone": "Semen Wello",
    "town": "Weldiya Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-waghimra-abergele",
    "region": "Amhara",
    "zone": "Waghimra",
    "town": "Abergele",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-waghimra-dehana",
    "region": "Amhara",
    "zone": "Waghimra",
    "town": "Dehana",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-waghimra-gazgibla",
    "region": "Amhara",
    "zone": "Waghimra",
    "town": "Gazgibla",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-waghimra-sahla-seyemt",
    "region": "Amhara",
    "zone": "Waghimra",
    "town": "Sahla Seyemt",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-waghimra-sekota-ketema-astedader",
    "region": "Amhara",
    "zone": "Waghimra",
    "town": "Sekota Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-waghimra-sekota-zuria",
    "region": "Amhara",
    "zone": "Waghimra",
    "town": "Sekota Zuria",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-waghimra-tsagibige",
    "region": "Amhara",
    "zone": "Waghimra",
    "town": "Tsagibige",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-amhara-waghimra-zikuala",
    "region": "Amhara",
    "zone": "Waghimra",
    "town": "Zikuala",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-benishangul-gumuz-assosa-assosa",
    "region": "Benishangul Gumuz",
    "zone": "Assosa",
    "town": "Assosa",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-benishangul-gumuz-assosa-bambasi",
    "region": "Benishangul Gumuz",
    "zone": "Assosa",
    "town": "Bambasi",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-benishangul-gumuz-assosa-homosha",
    "region": "Benishangul Gumuz",
    "zone": "Assosa",
    "town": "Homosha",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-benishangul-gumuz-assosa-kurmuk",
    "region": "Benishangul Gumuz",
    "zone": "Assosa",
    "town": "Kurmuk",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-benishangul-gumuz-assosa-menge",
    "region": "Benishangul Gumuz",
    "zone": "Assosa",
    "town": "Menge",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-benishangul-gumuz-assosa-odda-buldgilu",
    "region": "Benishangul Gumuz",
    "zone": "Assosa",
    "town": "Odda Buldgilu",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-benishangul-gumuz-assosa-sherqole",
    "region": "Benishangul Gumuz",
    "zone": "Assosa",
    "town": "Sherqole",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-benishangul-gumuz-assosa-woreda-and",
    "region": "Benishangul Gumuz",
    "zone": "Assosa",
    "town": "Woreda And",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-benishangul-gumuz-assosa-woreda-hulet",
    "region": "Benishangul Gumuz",
    "zone": "Assosa",
    "town": "Woreda Hulet",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-benishangul-gumuz-kemashi-agalo-meti",
    "region": "Benishangul Gumuz",
    "zone": "Kemashi",
    "town": "Agalo Meti",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-benishangul-gumuz-kemashi-bello-jiganfoy",
    "region": "Benishangul Gumuz",
    "zone": "Kemashi",
    "town": "Bello Jiganfoy",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-benishangul-gumuz-kemashi-kemashi",
    "region": "Benishangul Gumuz",
    "zone": "Kemashi",
    "town": "Kemashi",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-benishangul-gumuz-kemashi-sedal",
    "region": "Benishangul Gumuz",
    "zone": "Kemashi",
    "town": "Sedal",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-benishangul-gumuz-kemashi-yasso",
    "region": "Benishangul Gumuz",
    "zone": "Kemashi",
    "town": "Yasso",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-benishangul-gumuz-mao-ena-komo-mao-ena-komo",
    "region": "Benishangul Gumuz",
    "zone": "Mao Ena Komo",
    "town": "Mao Ena Komo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-benishangul-gumuz-metekel-bulen",
    "region": "Benishangul Gumuz",
    "zone": "Metekel",
    "town": "Bulen",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-benishangul-gumuz-metekel-dangur",
    "region": "Benishangul Gumuz",
    "zone": "Metekel",
    "town": "Dangur",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-benishangul-gumuz-metekel-debate",
    "region": "Benishangul Gumuz",
    "zone": "Metekel",
    "town": "Debate",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-benishangul-gumuz-metekel-guba",
    "region": "Benishangul Gumuz",
    "zone": "Metekel",
    "town": "Guba",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-benishangul-gumuz-metekel-mandura",
    "region": "Benishangul Gumuz",
    "zone": "Metekel",
    "town": "Mandura",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-benishangul-gumuz-metekel-pawe",
    "region": "Benishangul Gumuz",
    "zone": "Metekel",
    "town": "Pawe",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-benishangul-gumuz-metekel-wombera",
    "region": "Benishangul Gumuz",
    "zone": "Metekel",
    "town": "Wombera",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-gurage-abashige",
    "region": "Central Ethiopia",
    "zone": "Gurage",
    "town": "Abashige",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-gurage-agena-ketema-astedader",
    "region": "Central Ethiopia",
    "zone": "Gurage",
    "town": "Agena Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-gurage-arekit-ketema-astedader",
    "region": "Central Ethiopia",
    "zone": "Gurage",
    "town": "Arekit Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-gurage-cheha",
    "region": "Central Ethiopia",
    "zone": "Gurage",
    "town": "Cheha",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-gurage-emdiber-ketema-astedader",
    "region": "Central Ethiopia",
    "zone": "Gurage",
    "town": "Emdiber Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-gurage-endegagn",
    "region": "Central Ethiopia",
    "zone": "Gurage",
    "town": "Endegagn",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-gurage-enor",
    "region": "Central Ethiopia",
    "zone": "Gurage",
    "town": "Enor",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-gurage-enor-ener-mager",
    "region": "Central Ethiopia",
    "zone": "Gurage",
    "town": "Enor Ener Mager",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-gurage-ezha",
    "region": "Central Ethiopia",
    "zone": "Gurage",
    "town": "Ezha",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-gurage-gedebano-gutazar-welene",
    "region": "Central Ethiopia",
    "zone": "Gurage",
    "town": "Gedebano Gutazar Welene",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-gurage-geta",
    "region": "Central Ethiopia",
    "zone": "Gurage",
    "town": "Geta",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-gurage-gumer",
    "region": "Central Ethiopia",
    "zone": "Gurage",
    "town": "Gumer",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-gurage-gunchire-ketema-astedader",
    "region": "Central Ethiopia",
    "zone": "Gurage",
    "town": "Gunchire Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-gurage-mihur-ena-aklil",
    "region": "Central Ethiopia",
    "zone": "Gurage",
    "town": "Mihur Ena Aklil",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-gurage-wolkite-ketema-astedader",
    "region": "Central Ethiopia",
    "zone": "Gurage",
    "town": "Wolkite Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-hadiya-ameka",
    "region": "Central Ethiopia",
    "zone": "Hadiya",
    "town": "Ameka",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-hadiya-analemmo",
    "region": "Central Ethiopia",
    "zone": "Hadiya",
    "town": "Analemmo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-hadiya-bonosha-town-administration",
    "region": "Central Ethiopia",
    "zone": "Hadiya",
    "town": "Bonosha Town Administration",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-hadiya-duna",
    "region": "Central Ethiopia",
    "zone": "Hadiya",
    "town": "Duna",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-hadiya-fonko-town-administration",
    "region": "Central Ethiopia",
    "zone": "Hadiya",
    "town": "Fonko Town Administration",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-hadiya-gembora",
    "region": "Central Ethiopia",
    "zone": "Hadiya",
    "town": "Gembora",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-hadiya-gibe",
    "region": "Central Ethiopia",
    "zone": "Hadiya",
    "town": "Gibe",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-hadiya-gimbichu-ketema-astedader",
    "region": "Central Ethiopia",
    "zone": "Hadiya",
    "town": "Gimbichu Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-hadiya-homecho-town-administration",
    "region": "Central Ethiopia",
    "zone": "Hadiya",
    "town": "Homecho Town Administration",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-hadiya-hosana",
    "region": "Central Ethiopia",
    "zone": "Hadiya",
    "town": "Hosana",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-hadiya-jajura-ketema-astedader",
    "region": "Central Ethiopia",
    "zone": "Hadiya",
    "town": "Jajura Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-hadiya-limu",
    "region": "Central Ethiopia",
    "zone": "Hadiya",
    "town": "Limu",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-hadiya-merab-badawacho",
    "region": "Central Ethiopia",
    "zone": "Hadiya",
    "town": "Merab Badawacho",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-hadiya-mirab-soro",
    "region": "Central Ethiopia",
    "zone": "Hadiya",
    "town": "Mirab Soro",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-hadiya-misha",
    "region": "Central Ethiopia",
    "zone": "Hadiya",
    "town": "Misha",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-hadiya-misrak-badowoch",
    "region": "Central Ethiopia",
    "zone": "Hadiya",
    "town": "Misrak Badowoch",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-hadiya-shashego",
    "region": "Central Ethiopia",
    "zone": "Hadiya",
    "town": "Shashego",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-hadiya-shone-city-admin",
    "region": "Central Ethiopia",
    "zone": "Hadiya",
    "town": "Shone City Admin",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-hadiya-siraro-badowoch",
    "region": "Central Ethiopia",
    "zone": "Hadiya",
    "town": "Siraro Badowoch",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-hadiya-soro",
    "region": "Central Ethiopia",
    "zone": "Hadiya",
    "town": "Soro",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-halaba-atoti-ulo",
    "region": "Central Ethiopia",
    "zone": "Halaba",
    "town": "Atoti Ulo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-halaba-halaba-ketema-astedader",
    "region": "Central Ethiopia",
    "zone": "Halaba",
    "town": "Halaba Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-halaba-wera",
    "region": "Central Ethiopia",
    "zone": "Halaba",
    "town": "Wera",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-halaba-wera-dijo",
    "region": "Central Ethiopia",
    "zone": "Halaba",
    "town": "Wera Dijo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-kabena-liyu-kabena-liyu",
    "region": "Central Ethiopia",
    "zone": "Kabena Liyu",
    "town": "Kabena Liyu",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-kembata-adiloo-zuriya",
    "region": "Central Ethiopia",
    "zone": "Kembata",
    "town": "Adiloo Zuriya",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-kembata-angecha",
    "region": "Central Ethiopia",
    "zone": "Kembata",
    "town": "Angecha",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-kembata-angecha-ketema-astedader",
    "region": "Central Ethiopia",
    "zone": "Kembata",
    "town": "Angecha Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-kembata-damboya",
    "region": "Central Ethiopia",
    "zone": "Kembata",
    "town": "Damboya",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-kembata-damboya-keteme-astededar",
    "region": "Central Ethiopia",
    "zone": "Kembata",
    "town": "Damboya Keteme Astededar",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-kembata-doyogena",
    "region": "Central Ethiopia",
    "zone": "Kembata",
    "town": "Doyogena",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-kembata-durame-keteme-astedader",
    "region": "Central Ethiopia",
    "zone": "Kembata",
    "town": "Durame Keteme Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-kembata-hadaro-ketema-astidadar",
    "region": "Central Ethiopia",
    "zone": "Kembata",
    "town": "Hadaro Ketema Astidadar",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-kembata-hadaro-tunto",
    "region": "Central Ethiopia",
    "zone": "Kembata",
    "town": "Hadaro Tunto",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-kembata-kachabira",
    "region": "Central Ethiopia",
    "zone": "Kembata",
    "town": "Kachabira",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-kembata-kedida-gamella",
    "region": "Central Ethiopia",
    "zone": "Kembata",
    "town": "Kedida Gamella",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-kembata-shinshicho-ketema-astedader",
    "region": "Central Ethiopia",
    "zone": "Kembata",
    "town": "Shinshicho Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-mareko-liyu-mareko-liyu",
    "region": "Central Ethiopia",
    "zone": "Mareko Liyu",
    "town": "Mareko Liyu",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-misrak-gurage-bui-ketema-astedader",
    "region": "Central Ethiopia",
    "zone": "Misrak Gurage",
    "town": "Bui Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-misrak-gurage-butajira-ketema-astedader",
    "region": "Central Ethiopia",
    "zone": "Misrak Gurage",
    "town": "Butajira Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-misrak-gurage-debub-sodo",
    "region": "Central Ethiopia",
    "zone": "Misrak Gurage",
    "town": "Debub Sodo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-misrak-gurage-enseno-ketema-astedader",
    "region": "Central Ethiopia",
    "zone": "Misrak Gurage",
    "town": "Enseno Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-misrak-gurage-meskan",
    "region": "Central Ethiopia",
    "zone": "Misrak Gurage",
    "town": "Meskan",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-misrak-gurage-misrak-meskan",
    "region": "Central Ethiopia",
    "zone": "Misrak Gurage",
    "town": "Misrak Meskan",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-misrak-gurage-sodo",
    "region": "Central Ethiopia",
    "zone": "Misrak Gurage",
    "town": "Sodo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-silte-alem-gebeya-ketema-astedader",
    "region": "Central Ethiopia",
    "zone": "Silte",
    "town": "Alem Gebeya Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-silte-alicho-wiriro",
    "region": "Central Ethiopia",
    "zone": "Silte",
    "town": "Alicho Wiriro",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-silte-dalocha",
    "region": "Central Ethiopia",
    "zone": "Silte",
    "town": "Dalocha",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-silte-dalocha-ketema-astedader",
    "region": "Central Ethiopia",
    "zone": "Silte",
    "town": "Dalocha Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-silte-hulbareg",
    "region": "Central Ethiopia",
    "zone": "Silte",
    "town": "Hulbareg",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-silte-kibet-ketema-astedader",
    "region": "Central Ethiopia",
    "zone": "Silte",
    "town": "Kibet Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-silte-lanfuro",
    "region": "Central Ethiopia",
    "zone": "Silte",
    "town": "Lanfuro",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-silte-mirab-azernet-berbere",
    "region": "Central Ethiopia",
    "zone": "Silte",
    "town": "Mirab Azernet Berbere",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-silte-misrak-azernet-berbere",
    "region": "Central Ethiopia",
    "zone": "Silte",
    "town": "Misrak Azernet Berbere",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-silte-misrak-silte",
    "region": "Central Ethiopia",
    "zone": "Silte",
    "town": "Misrak Silte",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-silte-mito",
    "region": "Central Ethiopia",
    "zone": "Silte",
    "town": "Mito",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-silte-sankura",
    "region": "Central Ethiopia",
    "zone": "Silte",
    "town": "Sankura",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-silte-silte",
    "region": "Central Ethiopia",
    "zone": "Silte",
    "town": "Silte",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-silte-tora-ketema-astedader",
    "region": "Central Ethiopia",
    "zone": "Silte",
    "town": "Tora Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-silte-worabe-ketema-astedader",
    "region": "Central Ethiopia",
    "zone": "Silte",
    "town": "Worabe Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-tembaro-leyu-mudula-ketema-astedader",
    "region": "Central Ethiopia",
    "zone": "Tembaro Leyu",
    "town": "Mudula Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-tembaro-leyu-tembaro",
    "region": "Central Ethiopia",
    "zone": "Tembaro Leyu",
    "town": "Tembaro",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-yem-dori-saja",
    "region": "Central Ethiopia",
    "zone": "Yem",
    "town": "Dori Saja",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-yem-fofa",
    "region": "Central Ethiopia",
    "zone": "Yem",
    "town": "Fofa",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-yem-saja-ketama-astedader",
    "region": "Central Ethiopia",
    "zone": "Yem",
    "town": "Saja Ketama Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-central-ethiopia-yem-toba",
    "region": "Central Ethiopia",
    "zone": "Yem",
    "town": "Toba",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-dire-dawa-astedadar-dire-dawa-01-woreda-astedadar",
    "region": "Dire Dawa Astedadar",
    "zone": "Dire Dawa",
    "town": "01 Woreda Astedadar",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-dire-dawa-astedadar-dire-dawa-02-woreda-astedadar",
    "region": "Dire Dawa Astedadar",
    "zone": "Dire Dawa",
    "town": "02 Woreda Astedadar",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-dire-dawa-astedadar-dire-dawa-03-woreda-astedadar",
    "region": "Dire Dawa Astedadar",
    "zone": "Dire Dawa",
    "town": "03 Woreda Astedadar",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-dire-dawa-astedadar-dire-dawa-04-woreda-astedadar",
    "region": "Dire Dawa Astedadar",
    "zone": "Dire Dawa",
    "town": "04 Woreda Astedadar",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-dire-dawa-astedadar-dire-dawa-05-woreda-astedadar",
    "region": "Dire Dawa Astedadar",
    "zone": "Dire Dawa",
    "town": "05 Woreda Astedadar",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-dire-dawa-astedadar-dire-dawa-06-woreda-astedadar",
    "region": "Dire Dawa Astedadar",
    "zone": "Dire Dawa",
    "town": "06 Woreda Astedadar",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-dire-dawa-astedadar-dire-dawa-07-woreda-astedadar",
    "region": "Dire Dawa Astedadar",
    "zone": "Dire Dawa",
    "town": "07 Woreda Astedadar",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-dire-dawa-astedadar-dire-dawa-08-woreda-astedadar",
    "region": "Dire Dawa Astedadar",
    "zone": "Dire Dawa",
    "town": "08 Woreda Astedadar",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-dire-dawa-astedadar-dire-dawa-09-woreda-astedadar",
    "region": "Dire Dawa Astedadar",
    "zone": "Dire Dawa",
    "town": "09 Woreda Astedadar",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-dire-dawa-astedadar-dire-dawa-aseliso",
    "region": "Dire Dawa Astedadar",
    "zone": "Dire Dawa",
    "town": "Aseliso",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-dire-dawa-astedadar-dire-dawa-biyo-awale",
    "region": "Dire Dawa Astedadar",
    "zone": "Dire Dawa",
    "town": "Biyo Awale",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-dire-dawa-astedadar-dire-dawa-jaldesa-kelad",
    "region": "Dire Dawa Astedadar",
    "zone": "Dire Dawa",
    "town": "Jaldesa/Kelad",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-dire-dawa-astedadar-dire-dawa-wahil",
    "region": "Dire Dawa Astedadar",
    "zone": "Dire Dawa",
    "town": "Wahil",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-afder-bare",
    "region": "Ethiopia Somali",
    "zone": "Afder",
    "town": "Bare",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-afder-chereti",
    "region": "Ethiopia Somali",
    "zone": "Afder",
    "town": "Chereti",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-afder-dolo-bay",
    "region": "Ethiopia Somali",
    "zone": "Afder",
    "town": "Dolo Bay",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-afder-elkere",
    "region": "Ethiopia Somali",
    "zone": "Afder",
    "town": "Elkere",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-afder-godgod",
    "region": "Ethiopia Somali",
    "zone": "Afder",
    "town": "Godgod",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-afder-haregele",
    "region": "Ethiopia Somali",
    "zone": "Afder",
    "town": "Haregele",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-afder-kohle",
    "region": "Ethiopia Somali",
    "zone": "Afder",
    "town": "Kohle",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-afder-mirab-emiy",
    "region": "Ethiopia Somali",
    "zone": "Afder",
    "town": "Mirab Emiy",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-afder-raaso",
    "region": "Ethiopia Somali",
    "zone": "Afder",
    "town": "Raaso",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-dawa-hudet",
    "region": "Ethiopia Somali",
    "zone": "Dawa",
    "town": "Hudet",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-dawa-kadaduma",
    "region": "Ethiopia Somali",
    "zone": "Dawa",
    "town": "Kadaduma",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-dawa-moyale",
    "region": "Ethiopia Somali",
    "zone": "Dawa",
    "town": "Moyale",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-dawa-mubarek",
    "region": "Ethiopia Somali",
    "zone": "Dawa",
    "town": "Mubarek",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-dollo-boh",
    "region": "Ethiopia Somali",
    "zone": "Dollo",
    "town": "Boh",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-dollo-danot",
    "region": "Ethiopia Somali",
    "zone": "Dollo",
    "town": "Danot",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-dollo-daratole",
    "region": "Ethiopia Somali",
    "zone": "Dollo",
    "town": "Daratole",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-dollo-galladi",
    "region": "Ethiopia Somali",
    "zone": "Dollo",
    "town": "Galladi",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-dollo-gelahemur",
    "region": "Ethiopia Somali",
    "zone": "Dollo",
    "town": "Gelahemur",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-dollo-lehel-yuob",
    "region": "Ethiopia Somali",
    "zone": "Dollo",
    "town": "Lehel Yuob",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-dollo-warder",
    "region": "Ethiopia Somali",
    "zone": "Dollo",
    "town": "Warder",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-dollo-warder-ketema-astedader",
    "region": "Ethiopia Somali",
    "zone": "Dollo",
    "town": "Warder ketema astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-erer-fiqi",
    "region": "Ethiopia Somali",
    "zone": "Erer",
    "town": "Fiqi",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-erer-hamero",
    "region": "Ethiopia Somali",
    "zone": "Erer",
    "town": "Hamero",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-erer-legahida",
    "region": "Ethiopia Somali",
    "zone": "Erer",
    "town": "Legahida",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-erer-meyu-muliqe",
    "region": "Ethiopia Somali",
    "zone": "Erer",
    "town": "Meyu Muliqe",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-erer-qubi",
    "region": "Ethiopia Somali",
    "zone": "Erer",
    "town": "Qubi",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-erer-selihad",
    "region": "Ethiopia Somali",
    "zone": "Erer",
    "town": "Selihad",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-erer-wangey",
    "region": "Ethiopia Somali",
    "zone": "Erer",
    "town": "Wangey",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-erer-yohob",
    "region": "Ethiopia Somali",
    "zone": "Erer",
    "town": "Yohob",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-fafan-awebera",
    "region": "Ethiopia Somali",
    "zone": "Fafan",
    "town": "Awebera",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-fafan-babile",
    "region": "Ethiopia Somali",
    "zone": "Fafan",
    "town": "Babile",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-fafan-debub-jigjiga",
    "region": "Ethiopia Somali",
    "zone": "Fafan",
    "town": "Debub Jigjiga",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-fafan-golgeno",
    "region": "Ethiopia Somali",
    "zone": "Fafan",
    "town": "Golgeno",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-fafan-gursum",
    "region": "Ethiopia Somali",
    "zone": "Fafan",
    "town": "Gursum",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-fafan-harewa",
    "region": "Ethiopia Somali",
    "zone": "Fafan",
    "town": "Harewa",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-fafan-harores",
    "region": "Ethiopia Somali",
    "zone": "Fafan",
    "town": "Harores",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-fafan-harshin",
    "region": "Ethiopia Somali",
    "zone": "Fafan",
    "town": "Harshin",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-fafan-jijiga",
    "region": "Ethiopia Somali",
    "zone": "Fafan",
    "town": "Jijiga",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-fafan-qebribeyah",
    "region": "Ethiopia Somali",
    "zone": "Fafan",
    "town": "Qebribeyah",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-fafan-qoran-mula",
    "region": "Ethiopia Somali",
    "zone": "Fafan",
    "town": "Qoran Mula",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-fafan-togochale-city-admenistration",
    "region": "Ethiopia Somali",
    "zone": "Fafan",
    "town": "Togochale City Admenistration",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-fafan-tulu-guled",
    "region": "Ethiopia Somali",
    "zone": "Fafan",
    "town": "Tulu Guled",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-jerer-ararso",
    "region": "Ethiopia Somali",
    "zone": "Jerer",
    "town": "Ararso",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-jerer-aware",
    "region": "Ethiopia Somali",
    "zone": "Jerer",
    "town": "Aware",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-jerer-bilebur",
    "region": "Ethiopia Somali",
    "zone": "Jerer",
    "town": "Bilebur",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-jerer-buriqot",
    "region": "Ethiopia Somali",
    "zone": "Jerer",
    "town": "Buriqot",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-jerer-daror",
    "region": "Ethiopia Somali",
    "zone": "Jerer",
    "town": "Daror",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-jerer-degamedo",
    "region": "Ethiopia Somali",
    "zone": "Jerer",
    "town": "Degamedo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-jerer-degehabur",
    "region": "Ethiopia Somali",
    "zone": "Jerer",
    "town": "Degehabur",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-jerer-degehabur-city-administration",
    "region": "Ethiopia Somali",
    "zone": "Jerer",
    "town": "Degehabur City Administration",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-jerer-dig",
    "region": "Ethiopia Somali",
    "zone": "Jerer",
    "town": "Dig",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-jerer-gashamo",
    "region": "Ethiopia Somali",
    "zone": "Jerer",
    "town": "Gashamo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-jerer-gunegedo",
    "region": "Ethiopia Somali",
    "zone": "Jerer",
    "town": "Gunegedo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-jerer-yoale",
    "region": "Ethiopia Somali",
    "zone": "Jerer",
    "town": "Yoale",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-korahe-bodelay",
    "region": "Ethiopia Somali",
    "zone": "Korahe",
    "town": "Bodelay",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-korahe-debawayin",
    "region": "Ethiopia Somali",
    "zone": "Korahe",
    "town": "Debawayin",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-korahe-el-ogaden",
    "region": "Ethiopia Somali",
    "zone": "Korahe",
    "town": "El_ogaden",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-korahe-gogilo",
    "region": "Ethiopia Somali",
    "zone": "Korahe",
    "town": "Gogilo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-korahe-higilola",
    "region": "Ethiopia Somali",
    "zone": "Korahe",
    "town": "Higilola",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-korahe-kebridehar",
    "region": "Ethiopia Somali",
    "zone": "Korahe",
    "town": "Kebridehar",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-korahe-lasdenkere",
    "region": "Ethiopia Somali",
    "zone": "Korahe",
    "town": "Lasdenkere",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-korahe-marsin",
    "region": "Ethiopia Somali",
    "zone": "Korahe",
    "town": "Marsin",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-korahe-qebridahar-citiy-administration",
    "region": "Ethiopia Somali",
    "zone": "Korahe",
    "town": "Qebridahar Citiy Administration",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-korahe-shakosh",
    "region": "Ethiopia Somali",
    "zone": "Korahe",
    "town": "Shakosh",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-korahe-shilabo",
    "region": "Ethiopia Somali",
    "zone": "Korahe",
    "town": "Shilabo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-liben-bokolmayu",
    "region": "Ethiopia Somali",
    "zone": "Liben",
    "town": "Bokolmayu",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-liben-deka-softu",
    "region": "Ethiopia Somali",
    "zone": "Liben",
    "town": "Deka Softu",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-liben-dolo-addo",
    "region": "Ethiopia Somali",
    "zone": "Liben",
    "town": "Dolo Addo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-liben-filtu",
    "region": "Ethiopia Somali",
    "zone": "Liben",
    "town": "Filtu",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-liben-goro-bekeksa",
    "region": "Ethiopia Somali",
    "zone": "Liben",
    "town": "Goro Bekeksa",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-liben-gura-damole",
    "region": "Ethiopia Somali",
    "zone": "Liben",
    "town": "Gura Damole",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-liben-karssa-dula",
    "region": "Ethiopia Somali",
    "zone": "Liben",
    "town": "Karssa Dula",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-nogob-ayun",
    "region": "Ethiopia Somali",
    "zone": "Nogob",
    "town": "Ayun",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-nogob-duhun",
    "region": "Ethiopia Somali",
    "zone": "Nogob",
    "town": "Duhun",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-nogob-elweyne",
    "region": "Ethiopia Somali",
    "zone": "Nogob",
    "town": "Elweyne",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-nogob-gerbo",
    "region": "Ethiopia Somali",
    "zone": "Nogob",
    "town": "Gerbo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-nogob-hararey",
    "region": "Ethiopia Somali",
    "zone": "Nogob",
    "town": "Hararey",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-nogob-haroshegah",
    "region": "Ethiopia Somali",
    "zone": "Nogob",
    "town": "Haroshegah",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-nogob-sagage",
    "region": "Ethiopia Somali",
    "zone": "Nogob",
    "town": "Sagage",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-shebele-abaqero",
    "region": "Ethiopia Somali",
    "zone": "Shebele",
    "town": "Abaqero",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-shebele-adadle",
    "region": "Ethiopia Somali",
    "zone": "Shebele",
    "town": "Adadle",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-shebele-beerano",
    "region": "Ethiopia Somali",
    "zone": "Shebele",
    "town": "Beerano",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-shebele-danan",
    "region": "Ethiopia Somali",
    "zone": "Shebele",
    "town": "Danan",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-shebele-east-eme",
    "region": "Ethiopia Somali",
    "zone": "Shebele",
    "town": "East Eme",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-shebele-elelle",
    "region": "Ethiopia Somali",
    "zone": "Shebele",
    "town": "Elelle",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-shebele-ferfer",
    "region": "Ethiopia Somali",
    "zone": "Shebele",
    "town": "Ferfer",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-shebele-gode",
    "region": "Ethiopia Somali",
    "zone": "Shebele",
    "town": "Gode",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-shebele-gode-council",
    "region": "Ethiopia Somali",
    "zone": "Shebele",
    "town": "Gode Council",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-shebele-kelafo",
    "region": "Ethiopia Somali",
    "zone": "Shebele",
    "town": "Kelafo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-shebele-mustahil",
    "region": "Ethiopia Somali",
    "zone": "Shebele",
    "town": "Mustahil",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-siti-afdem",
    "region": "Ethiopia Somali",
    "zone": "Siti",
    "town": "Afdem",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-siti-aysha",
    "region": "Ethiopia Somali",
    "zone": "Siti",
    "town": "Aysha",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-siti-dembel",
    "region": "Ethiopia Somali",
    "zone": "Siti",
    "town": "Dembel",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-siti-erer",
    "region": "Ethiopia Somali",
    "zone": "Siti",
    "town": "Erer",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-siti-geblalu",
    "region": "Ethiopia Somali",
    "zone": "Siti",
    "town": "Geblalu",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-siti-gotabike",
    "region": "Ethiopia Somali",
    "zone": "Siti",
    "town": "Gotabike",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-siti-hadigala",
    "region": "Ethiopia Somali",
    "zone": "Siti",
    "town": "Hadigala",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-siti-me-aso",
    "region": "Ethiopia Somali",
    "zone": "Siti",
    "town": "Me'Aso",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-ethiopia-somali-siti-shinile",
    "region": "Ethiopia Somali",
    "zone": "Siti",
    "town": "Shinile",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-gambela-angewak-abobo",
    "region": "Gambela",
    "zone": "Angewak",
    "town": "Abobo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-gambela-angewak-dima",
    "region": "Gambela",
    "zone": "Angewak",
    "town": "Dima",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-gambela-angewak-gambela-zuriya",
    "region": "Gambela",
    "zone": "Angewak",
    "town": "Gambela Zuriya",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-gambela-angewak-gambella",
    "region": "Gambela",
    "zone": "Angewak",
    "town": "Gambella",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-gambela-angewak-gog",
    "region": "Gambela",
    "zone": "Angewak",
    "town": "Gog",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-gambela-angewak-jor",
    "region": "Gambela",
    "zone": "Angewak",
    "town": "Jor",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-gambela-itang-special-itang",
    "region": "Gambela",
    "zone": "Itang Special",
    "town": "Itang",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-gambela-mejenger-godere",
    "region": "Gambela",
    "zone": "Mejenger",
    "town": "Godere",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-gambela-mejenger-mengeshi",
    "region": "Gambela",
    "zone": "Mejenger",
    "town": "Mengeshi",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-gambela-newer-akobo",
    "region": "Gambela",
    "zone": "Newer",
    "town": "Akobo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-gambela-newer-jikawo",
    "region": "Gambela",
    "zone": "Newer",
    "town": "Jikawo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-gambela-newer-lare",
    "region": "Gambela",
    "zone": "Newer",
    "town": "Lare",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-gambela-newer-makoy",
    "region": "Gambela",
    "zone": "Newer",
    "town": "Makoy",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-gambela-newer-wantawo",
    "region": "Gambela",
    "zone": "Newer",
    "town": "Wantawo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-hareri-hareri-abadir",
    "region": "Hareri",
    "zone": "Hareri",
    "town": "Abadir",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-hareri-hareri-aboker",
    "region": "Hareri",
    "zone": "Hareri",
    "town": "Aboker",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-hareri-hareri-amir-nur",
    "region": "Hareri",
    "zone": "Hareri",
    "town": "Amir Nur",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-hareri-hareri-dire-teyara",
    "region": "Hareri",
    "zone": "Hareri",
    "town": "Dire Teyara",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-hareri-hareri-errer",
    "region": "Hareri",
    "zone": "Hareri",
    "town": "Errer",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-hareri-hareri-hakim",
    "region": "Hareri",
    "zone": "Hareri",
    "town": "Hakim",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-hareri-hareri-jinela",
    "region": "Hareri",
    "zone": "Hareri",
    "town": "Jinela",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-hareri-hareri-shenkor",
    "region": "Hareri",
    "zone": "Hareri",
    "town": "Shenkor",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-hareri-hareri-sofi",
    "region": "Hareri",
    "zone": "Hareri",
    "town": "Sofi",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-adama-liyu-aba-geda",
    "region": "Oromia",
    "zone": "Adama Liyu",
    "town": "Aba Geda",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-adama-liyu-bale",
    "region": "Oromia",
    "zone": "Adama Liyu",
    "town": "Bale",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-adama-liyu-boku",
    "region": "Oromia",
    "zone": "Adama Liyu",
    "town": "Boku",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-adama-liyu-denibel",
    "region": "Oromia",
    "zone": "Adama Liyu",
    "town": "Denibel",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-adama-liyu-dibe",
    "region": "Oromia",
    "zone": "Adama Liyu",
    "town": "Dibe",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-adama-liyu-logo",
    "region": "Oromia",
    "zone": "Adama Liyu",
    "town": "Logo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-ambo-city-admin-ambo",
    "region": "Oromia",
    "zone": "Ambo City Admin",
    "town": "Ambo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-arsi-amigna",
    "region": "Oromia",
    "zone": "Arsi",
    "town": "Amigna",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-arsi-aseko",
    "region": "Oromia",
    "zone": "Arsi",
    "town": "Aseko",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-arsi-bekoji-city-admin",
    "region": "Oromia",
    "zone": "Arsi",
    "town": "Bekoji City Admin",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-arsi-bele-gesigar",
    "region": "Oromia",
    "zone": "Arsi",
    "town": "Bele Gesigar",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-arsi-chole",
    "region": "Oromia",
    "zone": "Arsi",
    "town": "Chole",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-arsi-digalu-na-tijo",
    "region": "Oromia",
    "zone": "Arsi",
    "town": "Digalu Na Tijo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-arsi-diksis",
    "region": "Oromia",
    "zone": "Arsi",
    "town": "Diksis",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-arsi-dodota",
    "region": "Oromia",
    "zone": "Arsi",
    "town": "Dodota",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-arsi-gololcha",
    "region": "Oromia",
    "zone": "Arsi",
    "town": "Gololcha",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-arsi-guna",
    "region": "Oromia",
    "zone": "Arsi",
    "town": "Guna",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-arsi-hitosa",
    "region": "Oromia",
    "zone": "Arsi",
    "town": "Hitosa",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-arsi-honkolo-wabe",
    "region": "Oromia",
    "zone": "Arsi",
    "town": "Honkolo Wabe",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-arsi-jeju",
    "region": "Oromia",
    "zone": "Arsi",
    "town": "Jeju",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-arsi-lemu-na-bilbilo",
    "region": "Oromia",
    "zone": "Arsi",
    "town": "Lemu Na Bilbilo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-arsi-lodehitosa",
    "region": "Oromia",
    "zone": "Arsi",
    "town": "Lodehitosa",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-arsi-merti",
    "region": "Oromia",
    "zone": "Arsi",
    "town": "Merti",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-arsi-munesa",
    "region": "Oromia",
    "zone": "Arsi",
    "town": "Munesa",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-arsi-robe",
    "region": "Oromia",
    "zone": "Arsi",
    "town": "Robe",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-arsi-seru",
    "region": "Oromia",
    "zone": "Arsi",
    "town": "Seru",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-arsi-shanen-kolu",
    "region": "Oromia",
    "zone": "Arsi",
    "town": "Shanen Kolu",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-arsi-shirka",
    "region": "Oromia",
    "zone": "Arsi",
    "town": "Shirka",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-arsi-sire",
    "region": "Oromia",
    "zone": "Arsi",
    "town": "Sire",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-arsi-sude",
    "region": "Oromia",
    "zone": "Arsi",
    "town": "Sude",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-arsi-tena",
    "region": "Oromia",
    "zone": "Arsi",
    "town": "Tena",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-arsi-tiyo",
    "region": "Oromia",
    "zone": "Arsi",
    "town": "Tiyo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-arsi-zewaydugda",
    "region": "Oromia",
    "zone": "Arsi",
    "town": "Zewaydugda",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-asela-liyu-assela",
    "region": "Oromia",
    "zone": "Asela Liyu",
    "town": "Assela",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-bishan-guracha-liyu-bishan-guracha-city-adiminestration",
    "region": "Oromia",
    "zone": "Bishan Guracha Liyu",
    "town": "Bishan Guracha City Adiminestration",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-bishoftu-abusera",
    "region": "Oromia",
    "zone": "Bishoftu",
    "town": "Abusera",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-bishoftu-arsede",
    "region": "Oromia",
    "zone": "Bishoftu",
    "town": "Arsede",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-bishoftu-biftu",
    "region": "Oromia",
    "zone": "Bishoftu",
    "town": "Biftu",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-bishoftu-deka-bora",
    "region": "Oromia",
    "zone": "Bishoftu",
    "town": "Deka Bora",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-bishoftu-dire",
    "region": "Oromia",
    "zone": "Bishoftu",
    "town": "Dire",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-bishoftu-erere",
    "region": "Oromia",
    "zone": "Bishoftu",
    "town": "Erere",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-bishoftu-hora",
    "region": "Oromia",
    "zone": "Bishoftu",
    "town": "Hora",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-bishoftu-kilole",
    "region": "Oromia",
    "zone": "Bishoftu",
    "town": "Kilole",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-bishoftu-melka",
    "region": "Oromia",
    "zone": "Bishoftu",
    "town": "Melka",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-bishoftu-oda-nebe",
    "region": "Oromia",
    "zone": "Bishoftu",
    "town": "Oda Nebe",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-bishoftu-tedecha",
    "region": "Oromia",
    "zone": "Bishoftu",
    "town": "Tedecha",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-borena-dilo",
    "region": "Oromia",
    "zone": "Borena",
    "town": "Dilo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-borena-dire",
    "region": "Oromia",
    "zone": "Borena",
    "town": "Dire",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-borena-dubluk",
    "region": "Oromia",
    "zone": "Borena",
    "town": "Dubluk",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-borena-el-waye",
    "region": "Oromia",
    "zone": "Borena",
    "town": "El Waye",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-borena-gomole",
    "region": "Oromia",
    "zone": "Borena",
    "town": "Gomole",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-borena-guchi",
    "region": "Oromia",
    "zone": "Borena",
    "town": "Guchi",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-borena-miyo",
    "region": "Oromia",
    "zone": "Borena",
    "town": "Miyo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-borena-moyale",
    "region": "Oromia",
    "zone": "Borena",
    "town": "Moyale",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-borena-teltele",
    "region": "Oromia",
    "zone": "Borena",
    "town": "Teltele",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-borena-yabalo",
    "region": "Oromia",
    "zone": "Borena",
    "town": "Yabalo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-borena-yabelo-twon",
    "region": "Oromia",
    "zone": "Borena",
    "town": "Yabelo Twon",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-buno-bedele-bedele-zuriya",
    "region": "Oromia",
    "zone": "Buno Bedele",
    "town": "Bedele Zuriya",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-buno-bedele-bedelle",
    "region": "Oromia",
    "zone": "Buno Bedele",
    "town": "Bedelle",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-buno-bedele-borecha",
    "region": "Oromia",
    "zone": "Buno Bedele",
    "town": "Borecha",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-buno-bedele-chewaka",
    "region": "Oromia",
    "zone": "Buno Bedele",
    "town": "Chewaka",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-buno-bedele-chora",
    "region": "Oromia",
    "zone": "Buno Bedele",
    "town": "Chora",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-buno-bedele-dabo-hana",
    "region": "Oromia",
    "zone": "Buno Bedele",
    "town": "Dabo Hana",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-buno-bedele-dega",
    "region": "Oromia",
    "zone": "Buno Bedele",
    "town": "Dega",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-buno-bedele-didessa",
    "region": "Oromia",
    "zone": "Buno Bedele",
    "town": "Didessa",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-buno-bedele-gechi",
    "region": "Oromia",
    "zone": "Buno Bedele",
    "town": "Gechi",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-buno-bedele-makko",
    "region": "Oromia",
    "zone": "Buno Bedele",
    "town": "Makko",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-debub-mirab-shewa-ameya",
    "region": "Oromia",
    "zone": "Debub Mirab Shewa",
    "town": "Ameya",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-debub-mirab-shewa-bacho",
    "region": "Oromia",
    "zone": "Debub Mirab Shewa",
    "town": "Bacho",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-debub-mirab-shewa-dawo",
    "region": "Oromia",
    "zone": "Debub Mirab Shewa",
    "town": "Dawo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-debub-mirab-shewa-goro",
    "region": "Oromia",
    "zone": "Debub Mirab Shewa",
    "town": "Goro",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-debub-mirab-shewa-ilu",
    "region": "Oromia",
    "zone": "Debub Mirab Shewa",
    "town": "Ilu",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-debub-mirab-shewa-kersa-malima",
    "region": "Oromia",
    "zone": "Debub Mirab Shewa",
    "town": "Kersa Malima",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-debub-mirab-shewa-saden-soddo",
    "region": "Oromia",
    "zone": "Debub Mirab Shewa",
    "town": "Saden Soddo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-debub-mirab-shewa-sodo-dachi",
    "region": "Oromia",
    "zone": "Debub Mirab Shewa",
    "town": "Sodo Dachi",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-debub-mirab-shewa-tole",
    "region": "Oromia",
    "zone": "Debub Mirab Shewa",
    "town": "Tole",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-debub-mirab-shewa-wenchi",
    "region": "Oromia",
    "zone": "Debub Mirab Shewa",
    "town": "Wenchi",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-debub-mirab-shewa-woliso",
    "region": "Oromia",
    "zone": "Debub Mirab Shewa",
    "town": "Woliso",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-dodola-ketema-astedader-dodola-ketema-astedader",
    "region": "Oromia",
    "zone": "Dodola Ketema Astedader",
    "town": "Dodola Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-guji-adola",
    "region": "Oromia",
    "zone": "Guji",
    "town": "Adola",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-guji-adola-wayu-ketema",
    "region": "Oromia",
    "zone": "Guji",
    "town": "Adola Wayu Ketema",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-guji-aga-wayu",
    "region": "Oromia",
    "zone": "Guji",
    "town": "Aga Wayu",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-guji-anasora",
    "region": "Oromia",
    "zone": "Guji",
    "town": "Anasora",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-guji-bore",
    "region": "Oromia",
    "zone": "Guji",
    "town": "Bore",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-guji-dama",
    "region": "Oromia",
    "zone": "Guji",
    "town": "Dama",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-guji-gereja",
    "region": "Oromia",
    "zone": "Guji",
    "town": "Gereja",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-guji-haro-welabu",
    "region": "Oromia",
    "zone": "Guji",
    "town": "Haro Welabu",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-guji-odo-shakiso",
    "region": "Oromia",
    "zone": "Guji",
    "town": "Odo Shakiso",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-guji-seba-boru",
    "region": "Oromia",
    "zone": "Guji",
    "town": "Seba Boru",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-guji-shakiso-ketema-astedader",
    "region": "Oromia",
    "zone": "Guji",
    "town": "Shakiso Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-guji-uraga",
    "region": "Oromia",
    "zone": "Guji",
    "town": "Uraga",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-guji-wadara",
    "region": "Oromia",
    "zone": "Guji",
    "town": "Wadara",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-holeta-liyu-holeta",
    "region": "Oromia",
    "zone": "Holeta Liyu",
    "town": "Holeta",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-horo-guduru-wollega-abaychoman",
    "region": "Oromia",
    "zone": "Horo Guduru Wollega",
    "town": "Abaychoman",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-horo-guduru-wollega-abedongoro",
    "region": "Oromia",
    "zone": "Horo Guduru Wollega",
    "town": "Abedongoro",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-horo-guduru-wollega-amuru",
    "region": "Oromia",
    "zone": "Horo Guduru Wollega",
    "town": "Amuru",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-horo-guduru-wollega-chemon-guduru",
    "region": "Oromia",
    "zone": "Horo Guduru Wollega",
    "town": "Chemon Guduru",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-horo-guduru-wollega-guduru",
    "region": "Oromia",
    "zone": "Horo Guduru Wollega",
    "town": "Guduru",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-horo-guduru-wollega-hababoguduru",
    "region": "Oromia",
    "zone": "Horo Guduru Wollega",
    "town": "Hababoguduru",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-horo-guduru-wollega-horo",
    "region": "Oromia",
    "zone": "Horo Guduru Wollega",
    "town": "Horo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-horo-guduru-wollega-horo-buluk",
    "region": "Oromia",
    "zone": "Horo Guduru Wollega",
    "town": "Horo Buluk",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-horo-guduru-wollega-horo-shambu",
    "region": "Oromia",
    "zone": "Horo Guduru Wollega",
    "town": "Horo(shambu)",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-horo-guduru-wollega-jardaga-jarte",
    "region": "Oromia",
    "zone": "Horo Guduru Wollega",
    "town": "Jardaga Jarte",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-horo-guduru-wollega-jimarare",
    "region": "Oromia",
    "zone": "Horo Guduru Wollega",
    "town": "Jimarare",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-horo-guduru-wollega-jimmagenate",
    "region": "Oromia",
    "zone": "Horo Guduru Wollega",
    "town": "Jimmagenate",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-ilu-ababor-alge-sachi",
    "region": "Oromia",
    "zone": "Ilu Ababor",
    "town": "Alge Sachi",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-ilu-ababor-alle",
    "region": "Oromia",
    "zone": "Ilu Ababor",
    "town": "Alle",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-ilu-ababor-bacho",
    "region": "Oromia",
    "zone": "Ilu Ababor",
    "town": "Bacho",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-ilu-ababor-bilo-nopa",
    "region": "Oromia",
    "zone": "Ilu Ababor",
    "town": "Bilo Nopa",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-ilu-ababor-bure",
    "region": "Oromia",
    "zone": "Ilu Ababor",
    "town": "Bure",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-ilu-ababor-darimu",
    "region": "Oromia",
    "zone": "Ilu Ababor",
    "town": "Darimu",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-ilu-ababor-didu",
    "region": "Oromia",
    "zone": "Ilu Ababor",
    "town": "Didu",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-ilu-ababor-doranni",
    "region": "Oromia",
    "zone": "Ilu Ababor",
    "town": "Doranni",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-ilu-ababor-halu",
    "region": "Oromia",
    "zone": "Ilu Ababor",
    "town": "Halu",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-ilu-ababor-hurumu",
    "region": "Oromia",
    "zone": "Ilu Ababor",
    "town": "Hurumu",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-ilu-ababor-mettu",
    "region": "Oromia",
    "zone": "Ilu Ababor",
    "town": "Mettu",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-ilu-ababor-metu-ketema",
    "region": "Oromia",
    "zone": "Ilu Ababor",
    "town": "Metu Ketema",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-ilu-ababor-nono-sele",
    "region": "Oromia",
    "zone": "Ilu Ababor",
    "town": "Nono Sele",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-ilu-ababor-yayo",
    "region": "Oromia",
    "zone": "Ilu Ababor",
    "town": "Yayo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-jimma-agaro",
    "region": "Oromia",
    "zone": "Jimma",
    "town": "Agaro",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-jimma-boter-tolay",
    "region": "Oromia",
    "zone": "Jimma",
    "town": "Boter Tolay",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-jimma-cora-botar",
    "region": "Oromia",
    "zone": "Jimma",
    "town": "Cora Botar",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-jimma-dedo",
    "region": "Oromia",
    "zone": "Jimma",
    "town": "Dedo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-jimma-gera",
    "region": "Oromia",
    "zone": "Jimma",
    "town": "Gera",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-jimma-gomma",
    "region": "Oromia",
    "zone": "Jimma",
    "town": "Gomma",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-jimma-gumay",
    "region": "Oromia",
    "zone": "Jimma",
    "town": "Gumay",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-jimma-kersa",
    "region": "Oromia",
    "zone": "Jimma",
    "town": "Kersa",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-jimma-limu-kosa",
    "region": "Oromia",
    "zone": "Jimma",
    "town": "Limu Kosa",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-jimma-limu-seka",
    "region": "Oromia",
    "zone": "Jimma",
    "town": "Limu Seka",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-jimma-mana",
    "region": "Oromia",
    "zone": "Jimma",
    "town": "Mana",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-jimma-mencho",
    "region": "Oromia",
    "zone": "Jimma",
    "town": "Mencho",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-jimma-nono-benja",
    "region": "Oromia",
    "zone": "Jimma",
    "town": "Nono Benja",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-jimma-omo-beyam",
    "region": "Oromia",
    "zone": "Jimma",
    "town": "Omo Beyam",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-jimma-omo-nada",
    "region": "Oromia",
    "zone": "Jimma",
    "town": "Omo Nada",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-jimma-seka-chekorsa",
    "region": "Oromia",
    "zone": "Jimma",
    "town": "Seka Chekorsa",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-jimma-setema",
    "region": "Oromia",
    "zone": "Jimma",
    "town": "Setema",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-jimma-shebe-sonbo",
    "region": "Oromia",
    "zone": "Jimma",
    "town": "Shebe Sonbo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-jimma-sigimo",
    "region": "Oromia",
    "zone": "Jimma",
    "town": "Sigimo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-jimma-sokoru",
    "region": "Oromia",
    "zone": "Jimma",
    "town": "Sokoru",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-jimma-tiroafeta",
    "region": "Oromia",
    "zone": "Jimma",
    "town": "Tiroafeta",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-jimma-liyu-jimma",
    "region": "Oromia",
    "zone": "Jimma Liyu",
    "town": "Jimma",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-kelem-wollega-anfilo",
    "region": "Oromia",
    "zone": "Kelem Wollega",
    "town": "Anfilo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-kelem-wollega-chanka-woreda",
    "region": "Oromia",
    "zone": "Kelem Wollega",
    "town": "Chanka Woreda",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-kelem-wollega-dalle-sadi",
    "region": "Oromia",
    "zone": "Kelem Wollega",
    "town": "Dalle Sadi",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-kelem-wollega-dallewabara",
    "region": "Oromia",
    "zone": "Kelem Wollega",
    "town": "Dallewabara",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-kelem-wollega-dambi-dollo-town",
    "region": "Oromia",
    "zone": "Kelem Wollega",
    "town": "Dambi Dollo Town",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-kelem-wollega-gawo-kebe",
    "region": "Oromia",
    "zone": "Kelem Wollega",
    "town": "Gawo Kebe",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-kelem-wollega-gidami",
    "region": "Oromia",
    "zone": "Kelem Wollega",
    "town": "Gidami",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-kelem-wollega-hawagalan",
    "region": "Oromia",
    "zone": "Kelem Wollega",
    "town": "Hawagalan",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-kelem-wollega-jima-horo",
    "region": "Oromia",
    "zone": "Kelem Wollega",
    "town": "Jima Horo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-kelem-wollega-laloqile",
    "region": "Oromia",
    "zone": "Kelem Wollega",
    "town": "Laloqile",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-kelem-wollega-seyo",
    "region": "Oromia",
    "zone": "Kelem Wollega",
    "town": "Seyo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-kelem-wollega-yemalogi-walal",
    "region": "Oromia",
    "zone": "Kelem Wollega",
    "town": "Yemalogi Walal",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-merab-bale-agarfa",
    "region": "Oromia",
    "zone": "Merab Bale",
    "town": "Agarfa",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-merab-bale-arena-buluk",
    "region": "Oromia",
    "zone": "Merab Bale",
    "town": "Arena Buluk",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-merab-bale-berbere",
    "region": "Oromia",
    "zone": "Merab Bale",
    "town": "Berbere",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-merab-bale-delo-mena",
    "region": "Oromia",
    "zone": "Merab Bale",
    "town": "Delo Mena",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-merab-bale-dinsho",
    "region": "Oromia",
    "zone": "Merab Bale",
    "town": "Dinsho",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-merab-bale-gasera",
    "region": "Oromia",
    "zone": "Merab Bale",
    "town": "Gasera",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-merab-bale-goba",
    "region": "Oromia",
    "zone": "Merab Bale",
    "town": "Goba",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-merab-bale-goba-ketema",
    "region": "Oromia",
    "zone": "Merab Bale",
    "town": "Goba Ketema",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-merab-bale-goro",
    "region": "Oromia",
    "zone": "Merab Bale",
    "town": "Goro",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-merab-bale-gura-damole",
    "region": "Oromia",
    "zone": "Merab Bale",
    "town": "Gura Damole",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-merab-bale-sinana",
    "region": "Oromia",
    "zone": "Merab Bale",
    "town": "Sinana",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-arsi-adaba",
    "region": "Oromia",
    "zone": "Mirab Arsi",
    "town": "Adaba",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-arsi-arsi-negele",
    "region": "Oromia",
    "zone": "Mirab Arsi",
    "town": "Arsi Negele",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-arsi-arsi-negele-city-administration",
    "region": "Oromia",
    "zone": "Mirab Arsi",
    "town": "Arsi Negele City Administration",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-arsi-dodola",
    "region": "Oromia",
    "zone": "Mirab Arsi",
    "town": "Dodola",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-arsi-gadeb-asesa",
    "region": "Oromia",
    "zone": "Mirab Arsi",
    "town": "Gadeb Asesa",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-arsi-heben-arsi",
    "region": "Oromia",
    "zone": "Mirab Arsi",
    "town": "Heben Arsi",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-arsi-kofale",
    "region": "Oromia",
    "zone": "Mirab Arsi",
    "town": "Kofale",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-arsi-kokossa",
    "region": "Oromia",
    "zone": "Mirab Arsi",
    "town": "Kokossa",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-arsi-kore",
    "region": "Oromia",
    "zone": "Mirab Arsi",
    "town": "Kore",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-arsi-nensebo",
    "region": "Oromia",
    "zone": "Mirab Arsi",
    "town": "Nensebo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-arsi-shala",
    "region": "Oromia",
    "zone": "Mirab Arsi",
    "town": "Shala",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-arsi-shashemane",
    "region": "Oromia",
    "zone": "Mirab Arsi",
    "town": "Shashemane",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-arsi-siraro",
    "region": "Oromia",
    "zone": "Mirab Arsi",
    "town": "Siraro",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-arsi-wendo",
    "region": "Oromia",
    "zone": "Mirab Arsi",
    "town": "Wendo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-guji-abaya",
    "region": "Oromia",
    "zone": "Mirab Guji",
    "town": "Abaya",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-guji-birbirsa-kojowa",
    "region": "Oromia",
    "zone": "Mirab Guji",
    "town": "Birbirsa Kojowa",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-guji-bule-hora",
    "region": "Oromia",
    "zone": "Mirab Guji",
    "town": "Bule Hora",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-guji-bule-hora-town",
    "region": "Oromia",
    "zone": "Mirab Guji",
    "town": "Bule Hora Town",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-guji-dugda-dawa",
    "region": "Oromia",
    "zone": "Mirab Guji",
    "town": "Dugda Dawa",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-guji-galana",
    "region": "Oromia",
    "zone": "Mirab Guji",
    "town": "Galana",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-guji-hambela-wamena",
    "region": "Oromia",
    "zone": "Mirab Guji",
    "town": "Hambela Wamena",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-guji-kercha",
    "region": "Oromia",
    "zone": "Mirab Guji",
    "town": "Kercha",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-guji-malka-sodda",
    "region": "Oromia",
    "zone": "Mirab Guji",
    "town": "Malka Sodda",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-guji-soro-barrguda",
    "region": "Oromia",
    "zone": "Mirab Guji",
    "town": "Soro Barrguda",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-hararghe-ancar",
    "region": "Oromia",
    "zone": "Mirab Hararghe",
    "town": "Ancar",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-hararghe-bedesa-town-administration",
    "region": "Oromia",
    "zone": "Mirab Hararghe",
    "town": "Bedesa Town Administration",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-hararghe-boke",
    "region": "Oromia",
    "zone": "Mirab Hararghe",
    "town": "Boke",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-hararghe-burka-dhintu",
    "region": "Oromia",
    "zone": "Mirab Hararghe",
    "town": "Burka Dhintu",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-hararghe-chiro",
    "region": "Oromia",
    "zone": "Mirab Hararghe",
    "town": "Chiro",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-hararghe-chiro-town-administration",
    "region": "Oromia",
    "zone": "Mirab Hararghe",
    "town": "Chiro Town Administration",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-hararghe-daro-labu",
    "region": "Oromia",
    "zone": "Mirab Hararghe",
    "town": "Daro Labu",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-hararghe-doba",
    "region": "Oromia",
    "zone": "Mirab Hararghe",
    "town": "Doba",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-hararghe-gelemso-town-administration",
    "region": "Oromia",
    "zone": "Mirab Hararghe",
    "town": "Gelemso Town Administration",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-hararghe-gemechis",
    "region": "Oromia",
    "zone": "Mirab Hararghe",
    "town": "Gemechis",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-hararghe-guba-koricha",
    "region": "Oromia",
    "zone": "Mirab Hararghe",
    "town": "Guba Koricha",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-hararghe-gumbi-bordede",
    "region": "Oromia",
    "zone": "Mirab Hararghe",
    "town": "Gumbi Bordede",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-hararghe-habro",
    "region": "Oromia",
    "zone": "Mirab Hararghe",
    "town": "Habro",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-hararghe-hawi-gudina",
    "region": "Oromia",
    "zone": "Mirab Hararghe",
    "town": "Hawi Gudina",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-hararghe-hirna-town-administration",
    "region": "Oromia",
    "zone": "Mirab Hararghe",
    "town": "Hirna Town Administration",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-hararghe-machara-miceta-town-administration",
    "region": "Oromia",
    "zone": "Mirab Hararghe",
    "town": "Machara_Miceta Town Administration",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-hararghe-mesela",
    "region": "Oromia",
    "zone": "Mirab Hararghe",
    "town": "Mesela",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-hararghe-mieso",
    "region": "Oromia",
    "zone": "Mirab Hararghe",
    "town": "Mieso",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-hararghe-oda-bultum",
    "region": "Oromia",
    "zone": "Mirab Hararghe",
    "town": "Oda Bultum",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-hararghe-tulo",
    "region": "Oromia",
    "zone": "Mirab Hararghe",
    "town": "Tulo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-shewa-abuna-gindeberet",
    "region": "Oromia",
    "zone": "Mirab Shewa",
    "town": "Abuna Gindeberet",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-shewa-adea-berga",
    "region": "Oromia",
    "zone": "Mirab Shewa",
    "town": "Adea Berga",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-shewa-ambo-zuriyai",
    "region": "Oromia",
    "zone": "Mirab Shewa",
    "town": "Ambo Zuriyai",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-shewa-bako-tibe",
    "region": "Oromia",
    "zone": "Mirab Shewa",
    "town": "Bako Tibe",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-shewa-cheliya",
    "region": "Oromia",
    "zone": "Mirab Shewa",
    "town": "Cheliya",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-shewa-cobi",
    "region": "Oromia",
    "zone": "Mirab Shewa",
    "town": "Cobi",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-shewa-dano",
    "region": "Oromia",
    "zone": "Mirab Shewa",
    "town": "Dano",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-shewa-dendi",
    "region": "Oromia",
    "zone": "Mirab Shewa",
    "town": "Dendi",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-shewa-dire-inchini",
    "region": "Oromia",
    "zone": "Mirab Shewa",
    "town": "Dire Inchini",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-shewa-ejere",
    "region": "Oromia",
    "zone": "Mirab Shewa",
    "town": "Ejere",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-shewa-ejersa-lafo",
    "region": "Oromia",
    "zone": "Mirab Shewa",
    "town": "Ejersa Lafo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-shewa-elfeta",
    "region": "Oromia",
    "zone": "Mirab Shewa",
    "town": "Elfeta",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-shewa-gindeberet",
    "region": "Oromia",
    "zone": "Mirab Shewa",
    "town": "Gindeberet",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-shewa-ilu-galan",
    "region": "Oromia",
    "zone": "Mirab Shewa",
    "town": "Ilu Galan",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-shewa-jawi-liban",
    "region": "Oromia",
    "zone": "Mirab Shewa",
    "town": "Jawi Liban",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-shewa-jeldu",
    "region": "Oromia",
    "zone": "Mirab Shewa",
    "town": "Jeldu",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-shewa-jibat",
    "region": "Oromia",
    "zone": "Mirab Shewa",
    "town": "Jibat",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-shewa-medakegn",
    "region": "Oromia",
    "zone": "Mirab Shewa",
    "town": "Medakegn",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-shewa-meta-robi",
    "region": "Oromia",
    "zone": "Mirab Shewa",
    "town": "Meta Robi",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-shewa-meta-walkite",
    "region": "Oromia",
    "zone": "Mirab Shewa",
    "town": "Meta Walkite",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-shewa-nono",
    "region": "Oromia",
    "zone": "Mirab Shewa",
    "town": "Nono",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-shewa-toke-kutaye",
    "region": "Oromia",
    "zone": "Mirab Shewa",
    "town": "Toke Kutaye",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-wollega-ayira",
    "region": "Oromia",
    "zone": "Mirab Wollega",
    "town": "Ayira",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-wollega-babo-gambel",
    "region": "Oromia",
    "zone": "Mirab Wollega",
    "town": "Babo Gambel",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-wollega-begi",
    "region": "Oromia",
    "zone": "Mirab Wollega",
    "town": "Begi",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-wollega-boji-chokorsa",
    "region": "Oromia",
    "zone": "Mirab Wollega",
    "town": "Boji Chokorsa",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-wollega-bojidimaji",
    "region": "Oromia",
    "zone": "Mirab Wollega",
    "town": "Bojidimaji",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-wollega-ganji",
    "region": "Oromia",
    "zone": "Mirab Wollega",
    "town": "Ganji",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-wollega-gimbi",
    "region": "Oromia",
    "zone": "Mirab Wollega",
    "town": "Gimbi",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-wollega-gimbi-town",
    "region": "Oromia",
    "zone": "Mirab Wollega",
    "town": "Gimbi Town",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-wollega-guliso",
    "region": "Oromia",
    "zone": "Mirab Wollega",
    "town": "Guliso",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-wollega-haru",
    "region": "Oromia",
    "zone": "Mirab Wollega",
    "town": "Haru",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-wollega-homa",
    "region": "Oromia",
    "zone": "Mirab Wollega",
    "town": "Homa",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-wollega-jarso",
    "region": "Oromia",
    "zone": "Mirab Wollega",
    "town": "Jarso",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-wollega-kiltu-kara",
    "region": "Oromia",
    "zone": "Mirab Wollega",
    "town": "Kiltu Kara",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-wollega-kondala",
    "region": "Oromia",
    "zone": "Mirab Wollega",
    "town": "Kondala",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-wollega-lalo-asabi",
    "region": "Oromia",
    "zone": "Mirab Wollega",
    "town": "Lalo Asabi",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-wollega-leta-sibu",
    "region": "Oromia",
    "zone": "Mirab Wollega",
    "town": "Leta Sibu",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-wollega-mana-sibu",
    "region": "Oromia",
    "zone": "Mirab Wollega",
    "town": "Mana Sibu",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-wollega-mandi-town",
    "region": "Oromia",
    "zone": "Mirab Wollega",
    "town": "Mandi Town",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-wollega-nejo",
    "region": "Oromia",
    "zone": "Mirab Wollega",
    "town": "Nejo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-wollega-nejo-town",
    "region": "Oromia",
    "zone": "Mirab Wollega",
    "town": "Nejo Town",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-wollega-nole-kaba",
    "region": "Oromia",
    "zone": "Mirab Wollega",
    "town": "Nole Kaba",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-wollega-seyo-nole",
    "region": "Oromia",
    "zone": "Mirab Wollega",
    "town": "Seyo Nole",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-mirab-wollega-yubdo",
    "region": "Oromia",
    "zone": "Mirab Wollega",
    "town": "Yubdo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-bale-dawe-kachin",
    "region": "Oromia",
    "zone": "Misrak Bale",
    "town": "Dawe Kachin",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-bale-dawe-serer",
    "region": "Oromia",
    "zone": "Misrak Bale",
    "town": "Dawe Serer",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-bale-ginir",
    "region": "Oromia",
    "zone": "Misrak Bale",
    "town": "Ginir",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-bale-ginir-ketema-astedader",
    "region": "Oromia",
    "zone": "Misrak Bale",
    "town": "Ginir Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-bale-gololcha",
    "region": "Oromia",
    "zone": "Misrak Bale",
    "town": "Gololcha",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-bale-legahida",
    "region": "Oromia",
    "zone": "Misrak Bale",
    "town": "Legahida",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-bale-rayitu",
    "region": "Oromia",
    "zone": "Misrak Bale",
    "town": "Rayitu",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-bale-seweyna",
    "region": "Oromia",
    "zone": "Misrak Bale",
    "town": "Seweyna",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-borena-arero",
    "region": "Oromia",
    "zone": "Misrak Borena",
    "town": "Arero",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-borena-dhasi",
    "region": "Oromia",
    "zone": "Misrak Borena",
    "town": "Dhasi",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-borena-goro-dola",
    "region": "Oromia",
    "zone": "Misrak Borena",
    "town": "Goro Dola",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-borena-gumi-eldalo",
    "region": "Oromia",
    "zone": "Misrak Borena",
    "town": "Gumi Eldalo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-borena-liben",
    "region": "Oromia",
    "zone": "Misrak Borena",
    "town": "Liben",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-borena-meda-welabu",
    "region": "Oromia",
    "zone": "Misrak Borena",
    "town": "Meda Welabu",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-borena-negele-ketema-astedader",
    "region": "Oromia",
    "zone": "Misrak Borena",
    "town": "Negele Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-borena-wachile",
    "region": "Oromia",
    "zone": "Misrak Borena",
    "town": "Wachile",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-hararge-aweday-ketema",
    "region": "Oromia",
    "zone": "Misrak Hararge",
    "town": "Aweday Ketema",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-hararge-babile",
    "region": "Oromia",
    "zone": "Misrak Hararge",
    "town": "Babile",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-hararge-babile-city-admin",
    "region": "Oromia",
    "zone": "Misrak Hararge",
    "town": "Babile City Admin",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-hararge-bedeno",
    "region": "Oromia",
    "zone": "Misrak Hararge",
    "town": "Bedeno",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-hararge-chinaksen",
    "region": "Oromia",
    "zone": "Misrak Hararge",
    "town": "Chinaksen",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-hararge-deder",
    "region": "Oromia",
    "zone": "Misrak Hararge",
    "town": "Deder",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-hararge-deder-ketema-asetedader",
    "region": "Oromia",
    "zone": "Misrak Hararge",
    "town": "Deder Ketema Asetedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-hararge-fedis",
    "region": "Oromia",
    "zone": "Misrak Hararge",
    "town": "Fedis",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-hararge-girawa",
    "region": "Oromia",
    "zone": "Misrak Hararge",
    "town": "Girawa",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-hararge-golo-oda",
    "region": "Oromia",
    "zone": "Misrak Hararge",
    "town": "Golo Oda",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-hararge-goro-muti",
    "region": "Oromia",
    "zone": "Misrak Hararge",
    "town": "Goro Muti",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-hararge-gorogutu",
    "region": "Oromia",
    "zone": "Misrak Hararge",
    "town": "Gorogutu",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-hararge-gursum",
    "region": "Oromia",
    "zone": "Misrak Hararge",
    "town": "Gursum",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-hararge-haremaya",
    "region": "Oromia",
    "zone": "Misrak Hararge",
    "town": "Haremaya",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-hararge-haremaya-ketema",
    "region": "Oromia",
    "zone": "Misrak Hararge",
    "town": "Haremaya Ketema",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-hararge-jarso",
    "region": "Oromia",
    "zone": "Misrak Hararge",
    "town": "Jarso",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-hararge-kersa",
    "region": "Oromia",
    "zone": "Misrak Hararge",
    "town": "Kersa",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-hararge-kombolcha",
    "region": "Oromia",
    "zone": "Misrak Hararge",
    "town": "Kombolcha",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-hararge-kumbi",
    "region": "Oromia",
    "zone": "Misrak Hararge",
    "town": "Kumbi",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-hararge-kurfa-chele",
    "region": "Oromia",
    "zone": "Misrak Hararge",
    "town": "Kurfa Chele",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-hararge-melka-belo",
    "region": "Oromia",
    "zone": "Misrak Hararge",
    "town": "Melka Belo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-hararge-meta",
    "region": "Oromia",
    "zone": "Misrak Hararge",
    "town": "Meta",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-hararge-meyu-muluke",
    "region": "Oromia",
    "zone": "Misrak Hararge",
    "town": "Meyu Muluke",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-hararge-midaga-tola",
    "region": "Oromia",
    "zone": "Misrak Hararge",
    "town": "Midaga Tola",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-shewa-adama",
    "region": "Oromia",
    "zone": "Misrak Shewa",
    "town": "Adama",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-shewa-adamitulu",
    "region": "Oromia",
    "zone": "Misrak Shewa",
    "town": "Adamitulu",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-shewa-adea",
    "region": "Oromia",
    "zone": "Misrak Shewa",
    "town": "Adea",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-shewa-akeki",
    "region": "Oromia",
    "zone": "Misrak Shewa",
    "town": "Akeki",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-shewa-batu-ketema-astedader",
    "region": "Oromia",
    "zone": "Misrak Shewa",
    "town": "Batu Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-shewa-bora",
    "region": "Oromia",
    "zone": "Misrak Shewa",
    "town": "Bora",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-shewa-boset",
    "region": "Oromia",
    "zone": "Misrak Shewa",
    "town": "Boset",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-shewa-dugda",
    "region": "Oromia",
    "zone": "Misrak Shewa",
    "town": "Dugda",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-shewa-fentale",
    "region": "Oromia",
    "zone": "Misrak Shewa",
    "town": "Fentale",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-shewa-gimbichu",
    "region": "Oromia",
    "zone": "Misrak Shewa",
    "town": "Gimbichu",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-shewa-liben-chukala",
    "region": "Oromia",
    "zone": "Misrak Shewa",
    "town": "Liben Chukala",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-shewa-lume",
    "region": "Oromia",
    "zone": "Misrak Shewa",
    "town": "Lume",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-wollega-anger-gute-town",
    "region": "Oromia",
    "zone": "Misrak Wollega",
    "town": "Anger Gute Town",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-wollega-bonayaboshe",
    "region": "Oromia",
    "zone": "Misrak Wollega",
    "town": "Bonayaboshe",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-wollega-diga",
    "region": "Oromia",
    "zone": "Misrak Wollega",
    "town": "Diga",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-wollega-ebantu",
    "region": "Oromia",
    "zone": "Misrak Wollega",
    "town": "Ebantu",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-wollega-gida-ayana",
    "region": "Oromia",
    "zone": "Misrak Wollega",
    "town": "Gida Ayana",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-wollega-gobu-seyo",
    "region": "Oromia",
    "zone": "Misrak Wollega",
    "town": "Gobu Seyo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-wollega-gudaya-bila",
    "region": "Oromia",
    "zone": "Misrak Wollega",
    "town": "Gudaya Bila",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-wollega-gutogida",
    "region": "Oromia",
    "zone": "Misrak Wollega",
    "town": "Gutogida",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-wollega-haro-limu",
    "region": "Oromia",
    "zone": "Misrak Wollega",
    "town": "Haro Limu",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-wollega-jima-arjo",
    "region": "Oromia",
    "zone": "Misrak Wollega",
    "town": "Jima Arjo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-wollega-kiramu",
    "region": "Oromia",
    "zone": "Misrak Wollega",
    "town": "Kiramu",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-wollega-leka-dulecha",
    "region": "Oromia",
    "zone": "Misrak Wollega",
    "town": "Leka Dulecha",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-wollega-limu",
    "region": "Oromia",
    "zone": "Misrak Wollega",
    "town": "Limu",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-wollega-nunu-kumba",
    "region": "Oromia",
    "zone": "Misrak Wollega",
    "town": "Nunu Kumba",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-wollega-sasiga",
    "region": "Oromia",
    "zone": "Misrak Wollega",
    "town": "Sasiga",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-wollega-sibu-sire",
    "region": "Oromia",
    "zone": "Misrak Wollega",
    "town": "Sibu Sire",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-wollega-wama-hagelo",
    "region": "Oromia",
    "zone": "Misrak Wollega",
    "town": "Wama Hagelo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-misrak-wollega-wayu-tuqa",
    "region": "Oromia",
    "zone": "Misrak Wollega",
    "town": "Wayu Tuqa",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-modjo-liyu-modjo",
    "region": "Oromia",
    "zone": "Modjo Liyu",
    "town": "Modjo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-nekemte-liyu-nekemte",
    "region": "Oromia",
    "zone": "Nekemte Liyu",
    "town": "Nekemte",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-oromiya-liyu-berak",
    "region": "Oromia",
    "zone": "Oromiya Liyu",
    "town": "Berak",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-oromiya-liyu-mulo",
    "region": "Oromia",
    "zone": "Oromiya Liyu",
    "town": "Mulo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-oromiya-liyu-sabata-hawas",
    "region": "Oromia",
    "zone": "Oromiya Liyu",
    "town": "Sabata Hawas",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-oromiya-liyu-sendafa-bake",
    "region": "Oromia",
    "zone": "Oromiya Liyu",
    "town": "Sendafa Bake",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-oromiya-liyu-sululta",
    "region": "Oromia",
    "zone": "Oromiya Liyu",
    "town": "Sululta",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-oromiya-liyu-walmara",
    "region": "Oromia",
    "zone": "Oromiya Liyu",
    "town": "Walmara",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-robe-liyu-robe-ketema-astedader",
    "region": "Oromia",
    "zone": "Robe Liyu",
    "town": "Robe Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-semen-shewa-abichu-and-gnea-woreda",
    "region": "Oromia",
    "zone": "Semen Shewa",
    "town": "Abichu And Gnea Woreda",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-semen-shewa-aleltu",
    "region": "Oromia",
    "zone": "Semen Shewa",
    "town": "Aleltu",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-semen-shewa-dagam",
    "region": "Oromia",
    "zone": "Semen Shewa",
    "town": "Dagam",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-semen-shewa-darra",
    "region": "Oromia",
    "zone": "Semen Shewa",
    "town": "Darra",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-semen-shewa-debre-libanos",
    "region": "Oromia",
    "zone": "Semen Shewa",
    "town": "Debre Libanos",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-semen-shewa-fiche",
    "region": "Oromia",
    "zone": "Semen Shewa",
    "town": "Fiche",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-semen-shewa-girar-jarso",
    "region": "Oromia",
    "zone": "Semen Shewa",
    "town": "Girar Jarso",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-semen-shewa-hidebu-abote",
    "region": "Oromia",
    "zone": "Semen Shewa",
    "town": "Hidebu Abote",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-semen-shewa-jida",
    "region": "Oromia",
    "zone": "Semen Shewa",
    "town": "Jida",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-semen-shewa-kimbibit",
    "region": "Oromia",
    "zone": "Semen Shewa",
    "town": "Kimbibit",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-semen-shewa-kuyu",
    "region": "Oromia",
    "zone": "Semen Shewa",
    "town": "Kuyu",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-semen-shewa-wara-jarso",
    "region": "Oromia",
    "zone": "Semen Shewa",
    "town": "Wara Jarso",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-semen-shewa-wuchale",
    "region": "Oromia",
    "zone": "Semen Shewa",
    "town": "Wuchale",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-semen-shewa-yaya-gulele",
    "region": "Oromia",
    "zone": "Semen Shewa",
    "town": "Yaya Gulele",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-shashamane-liyu-shashamane-ketema",
    "region": "Oromia",
    "zone": "Shashamane Liyu",
    "town": "Shashamane Ketema",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-sheger-abbaa-gadaa",
    "region": "Oromia",
    "zone": "Sheger",
    "town": "Abbaa Gadaa",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-sheger-akako",
    "region": "Oromia",
    "zone": "Sheger",
    "town": "Akako",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-sheger-andode",
    "region": "Oromia",
    "zone": "Sheger",
    "town": "Andode",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-sheger-anne-dima",
    "region": "Oromia",
    "zone": "Sheger",
    "town": "Anne Dima",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-sheger-bero",
    "region": "Oromia",
    "zone": "Sheger",
    "town": "Bero",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-sheger-caffe",
    "region": "Oromia",
    "zone": "Sheger",
    "town": "Caffe",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-sheger-chefe-karabu",
    "region": "Oromia",
    "zone": "Sheger",
    "town": "Chefe Karabu",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-sheger-dalleti",
    "region": "Oromia",
    "zone": "Sheger",
    "town": "Dalleti",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-sheger-denbel-tafo",
    "region": "Oromia",
    "zone": "Sheger",
    "town": "Denbel Tafo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-sheger-dire-sekoru",
    "region": "Oromia",
    "zone": "Sheger",
    "town": "Dire Sekoru",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-sheger-eco-abeba-limat",
    "region": "Oromia",
    "zone": "Sheger",
    "town": "Eco Abeba Limat",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-sheger-egdu",
    "region": "Oromia",
    "zone": "Sheger",
    "town": "Egdu",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-sheger-ejersa-goro",
    "region": "Oromia",
    "zone": "Sheger",
    "town": "Ejersa Goro",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-sheger-eka-saden",
    "region": "Oromia",
    "zone": "Sheger",
    "town": "Eka Saden",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-sheger-geda-faji",
    "region": "Oromia",
    "zone": "Sheger",
    "town": "Geda Faji",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-sheger-gefersa-burayu",
    "region": "Oromia",
    "zone": "Sheger",
    "town": "Gefersa Burayu",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-sheger-gelan",
    "region": "Oromia",
    "zone": "Sheger",
    "town": "Gelan",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-sheger-gelan-arebsa",
    "region": "Oromia",
    "zone": "Sheger",
    "town": "Gelan Arebsa",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-sheger-gelan-guda",
    "region": "Oromia",
    "zone": "Sheger",
    "town": "Gelan Guda",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-sheger-guddu",
    "region": "Oromia",
    "zone": "Sheger",
    "town": "Guddu",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-sheger-guje",
    "region": "Oromia",
    "zone": "Sheger",
    "town": "Guje",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-sheger-katta",
    "region": "Oromia",
    "zone": "Sheger",
    "town": "Katta",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-sheger-kolobo",
    "region": "Oromia",
    "zone": "Sheger",
    "town": "Kolobo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-sheger-kura-jida",
    "region": "Oromia",
    "zone": "Sheger",
    "town": "Kura Jida",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-sheger-lege-dadi-dale",
    "region": "Oromia",
    "zone": "Sheger",
    "town": "Lege Dadi Dale",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-sheger-lekule-geja",
    "region": "Oromia",
    "zone": "Sheger",
    "town": "Lekule Geja",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-sheger-malka-gafarsa",
    "region": "Oromia",
    "zone": "Sheger",
    "town": "Malka Gafarsa",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-sheger-metta",
    "region": "Oromia",
    "zone": "Sheger",
    "town": "Metta",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-sheger-mogle",
    "region": "Oromia",
    "zone": "Sheger",
    "town": "Mogle",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-sheger-muda-furi",
    "region": "Oromia",
    "zone": "Sheger",
    "town": "Muda Furi",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-sheger-nonno",
    "region": "Oromia",
    "zone": "Sheger",
    "town": "Nonno",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-sheger-salam-abeba-limat",
    "region": "Oromia",
    "zone": "Sheger",
    "town": "Salam Abeba Limat",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-sheger-sida-awash",
    "region": "Oromia",
    "zone": "Sheger",
    "town": "Sida Awash",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-sheger-tele-ababa-limat",
    "region": "Oromia",
    "zone": "Sheger",
    "town": "Tele Ababa Limat",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-sheger-tufa-muna",
    "region": "Oromia",
    "zone": "Sheger",
    "town": "Tufa Muna",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-sheger-tulu-dimtu",
    "region": "Oromia",
    "zone": "Sheger",
    "town": "Tulu Dimtu",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-sheger-wasarbi",
    "region": "Oromia",
    "zone": "Sheger",
    "town": "Wasarbi",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-sheger-wedassa",
    "region": "Oromia",
    "zone": "Sheger",
    "town": "Wedassa",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-sheger-welgaho-legaberi",
    "region": "Oromia",
    "zone": "Sheger",
    "town": "Welgaho Legaberi",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-oromia-woliso-liyu-woliso",
    "region": "Oromia",
    "zone": "Woliso Liyu",
    "town": "Woliso",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-sidama-hawassa-city-administration-adiss-ketema",
    "region": "Sidama",
    "zone": "Hawassa City Administration",
    "town": "Adiss Ketema",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-sidama-hawassa-city-administration-bahel-adarash",
    "region": "Sidama",
    "zone": "Hawassa City Administration",
    "town": "Bahel Adarash",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-sidama-hawassa-city-administration-haik-dar",
    "region": "Sidama",
    "zone": "Hawassa City Administration",
    "town": "Haik Dar",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-sidama-hawassa-city-administration-hawela-tula",
    "region": "Sidama",
    "zone": "Hawassa City Administration",
    "town": "Hawela Tula",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-sidama-hawassa-city-administration-mehal-ketema",
    "region": "Sidama",
    "zone": "Hawassa City Administration",
    "town": "Mehal Ketema",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-sidama-hawassa-city-administration-meneharya",
    "region": "Sidama",
    "zone": "Hawassa City Administration",
    "town": "Meneharya",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-sidama-hawassa-city-administration-misrak",
    "region": "Sidama",
    "zone": "Hawassa City Administration",
    "town": "Misrak",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-sidama-hawassa-city-administration-tabor",
    "region": "Sidama",
    "zone": "Hawassa City Administration",
    "town": "Tabor",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-sidama-sidama-debubawi-aleta-chuko",
    "region": "Sidama",
    "zone": "Sidama Debubawi",
    "town": "Aleta Chuko",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-sidama-sidama-debubawi-aleta-wondo",
    "region": "Sidama",
    "zone": "Sidama Debubawi",
    "town": "Aleta Wondo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-sidama-sidama-debubawi-aleta-wondo-city-administration",
    "region": "Sidama",
    "zone": "Sidama Debubawi",
    "town": "Aleta Wondo City Administration",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-sidama-sidama-debubawi-bursa",
    "region": "Sidama",
    "zone": "Sidama Debubawi",
    "town": "Bursa",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-sidama-sidama-debubawi-chirone",
    "region": "Sidama",
    "zone": "Sidama Debubawi",
    "town": "Chirone",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-sidama-sidama-debubawi-chuko-ketema-asetedader",
    "region": "Sidama",
    "zone": "Sidama Debubawi",
    "town": "Chuko Ketema Asetedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-sidama-sidama-debubawi-dara",
    "region": "Sidama",
    "zone": "Sidama Debubawi",
    "town": "Dara",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-sidama-sidama-debubawi-dara-otilcho",
    "region": "Sidama",
    "zone": "Sidama Debubawi",
    "town": "Dara Otilcho",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-sidama-sidama-debubawi-hula",
    "region": "Sidama",
    "zone": "Sidama Debubawi",
    "town": "Hula",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-sidama-sidama-debubawi-teticha",
    "region": "Sidama",
    "zone": "Sidama Debubawi",
    "town": "Teticha",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-sidama-sidama-mehal-arbegona",
    "region": "Sidama",
    "zone": "Sidama Mehal",
    "town": "Arbegona",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-sidama-sidama-mehal-dale",
    "region": "Sidama",
    "zone": "Sidama Mehal",
    "town": "Dale",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-sidama-sidama-mehal-darara",
    "region": "Sidama",
    "zone": "Sidama Mehal",
    "town": "Darara",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-sidama-sidama-mehal-loko-abaya",
    "region": "Sidama",
    "zone": "Sidama Mehal",
    "town": "Loko Abaya",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-sidama-sidama-mehal-shafamo",
    "region": "Sidama",
    "zone": "Sidama Mehal",
    "town": "Shafamo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-sidama-sidama-mehal-wonsho",
    "region": "Sidama",
    "zone": "Sidama Mehal",
    "town": "Wonsho",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-sidama-sidama-mehal-yirgalem-city-admin",
    "region": "Sidama",
    "zone": "Sidama Mehal",
    "town": "Yirgalem City Admin",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-sidama-sidama-misrakawi-aroresa",
    "region": "Sidama",
    "zone": "Sidama Misrakawi",
    "town": "Aroresa",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-sidama-sidama-misrakawi-bensa",
    "region": "Sidama",
    "zone": "Sidama Misrakawi",
    "town": "Bensa",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-sidama-sidama-misrakawi-bona-zuria",
    "region": "Sidama",
    "zone": "Sidama Misrakawi",
    "town": "Bona Zuria",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-sidama-sidama-misrakawi-bura",
    "region": "Sidama",
    "zone": "Sidama Misrakawi",
    "town": "Bura",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-sidama-sidama-misrakawi-chebe-gambeltu",
    "region": "Sidama",
    "zone": "Sidama Misrakawi",
    "town": "Chebe Gambeltu",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-sidama-sidama-misrakawi-chire",
    "region": "Sidama",
    "zone": "Sidama Misrakawi",
    "town": "Chire",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-sidama-sidama-misrakawi-daela",
    "region": "Sidama",
    "zone": "Sidama Misrakawi",
    "town": "Daela",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-sidama-sidama-misrakawi-daye-ketema-astedader",
    "region": "Sidama",
    "zone": "Sidama Misrakawi",
    "town": "Daye Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-sidama-sidama-misrakawi-hoko",
    "region": "Sidama",
    "zone": "Sidama Misrakawi",
    "town": "Hoko",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-sidama-sidama-semenawi-bilate-zuriya",
    "region": "Sidama",
    "zone": "Sidama Semenawi",
    "town": "Bilate Zuriya",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-sidama-sidama-semenawi-boricha",
    "region": "Sidama",
    "zone": "Sidama Semenawi",
    "town": "Boricha",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-sidama-sidama-semenawi-chuko-ketema-asetedader",
    "region": "Sidama",
    "zone": "Sidama Semenawi",
    "town": "Chuko Ketema Asetedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-sidama-sidama-semenawi-gorche",
    "region": "Sidama",
    "zone": "Sidama Semenawi",
    "town": "Gorche",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-sidama-sidama-semenawi-hawassa-zuriya",
    "region": "Sidama",
    "zone": "Sidama Semenawi",
    "town": "Hawassa Zuriya",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-sidama-sidama-semenawi-hawla-lida",
    "region": "Sidama",
    "zone": "Sidama Semenawi",
    "town": "Hawla Lida",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-sidama-sidama-semenawi-leku-ketema-asetedader",
    "region": "Sidama",
    "zone": "Sidama Semenawi",
    "town": "Leku Ketema Asetedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-sidama-sidama-semenawi-malga",
    "region": "Sidama",
    "zone": "Sidama Semenawi",
    "town": "Malga",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-sidama-sidama-semenawi-shebedino",
    "region": "Sidama",
    "zone": "Sidama Semenawi",
    "town": "Shebedino",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-sidama-sidama-semenawi-wendo-genet",
    "region": "Sidama",
    "zone": "Sidama Semenawi",
    "town": "Wendo Genet",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-alle-kolango-ketema-astedader",
    "region": "South Ethiopia",
    "zone": "Alle",
    "town": "Kolango Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-alle-kolango-zuriya",
    "region": "South Ethiopia",
    "zone": "Alle",
    "town": "Kolango Zuriya",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-ari-baka-dawela-ari",
    "region": "South Ethiopia",
    "zone": "Ari",
    "town": "Baka Dawela Ari",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-ari-debub-ari",
    "region": "South Ethiopia",
    "zone": "Ari",
    "town": "Debub Ari",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-ari-gelila-ketema-astedader",
    "region": "South Ethiopia",
    "zone": "Ari",
    "town": "Gelila Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-ari-jinka-ketema-astedader",
    "region": "South Ethiopia",
    "zone": "Ari",
    "town": "Jinka Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-ari-semen-ari",
    "region": "South Ethiopia",
    "zone": "Ari",
    "town": "Semen Ari",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-ari-woba-ari",
    "region": "South Ethiopia",
    "zone": "Ari",
    "town": "Woba Ari",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-basketo-special-basketo",
    "region": "South Ethiopia",
    "zone": "Basketo Special",
    "town": "Basketo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-burji-burji",
    "region": "South Ethiopia",
    "zone": "Burji",
    "town": "Burji",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-debub-omo-bena-tsemay",
    "region": "South Ethiopia",
    "zone": "Debub Omo",
    "town": "Bena Tsemay",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-debub-omo-dasenech",
    "region": "South Ethiopia",
    "zone": "Debub Omo",
    "town": "Dasenech",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-debub-omo-hamer",
    "region": "South Ethiopia",
    "zone": "Debub Omo",
    "town": "Hamer",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-debub-omo-malle",
    "region": "South Ethiopia",
    "zone": "Debub Omo",
    "town": "Malle",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-debub-omo-nyangatom",
    "region": "South Ethiopia",
    "zone": "Debub Omo",
    "town": "Nyangatom",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-debub-omo-salamago",
    "region": "South Ethiopia",
    "zone": "Debub Omo",
    "town": "Salamago",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-debub-omo-turmi-ketema-astedader",
    "region": "South Ethiopia",
    "zone": "Debub Omo",
    "town": "Turmi Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-dilla-city-admin-dilla-bedecha-town",
    "region": "South Ethiopia",
    "zone": "Dilla City Admin",
    "town": "Dilla Bedecha Town",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-dilla-city-admin-dilla-harowelabo-town",
    "region": "South Ethiopia",
    "zone": "Dilla City Admin",
    "town": "Dilla Harowelabo Town",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-dilla-city-admin-dilla-sessa-town",
    "region": "South Ethiopia",
    "zone": "Dilla City Admin",
    "town": "Dilla Sessa Town",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-gamo-arba-minch-ketema-astededader",
    "region": "South Ethiopia",
    "zone": "Gamo",
    "town": "Arba Minch Ketema Astededader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-gamo-arbaminch-zuriya",
    "region": "South Ethiopia",
    "zone": "Gamo",
    "town": "Arbaminch Zuriya",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-gamo-bonke",
    "region": "South Ethiopia",
    "zone": "Gamo",
    "town": "Bonke",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-gamo-boreda",
    "region": "South Ethiopia",
    "zone": "Gamo",
    "town": "Boreda",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-gamo-chencha-ketema-asetedader",
    "region": "South Ethiopia",
    "zone": "Gamo",
    "town": "Chencha Ketema Asetedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-gamo-chencha-zuriya",
    "region": "South Ethiopia",
    "zone": "Gamo",
    "town": "Chencha Zuriya",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-gamo-deremalo",
    "region": "South Ethiopia",
    "zone": "Gamo",
    "town": "Deremalo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-gamo-dita",
    "region": "South Ethiopia",
    "zone": "Gamo",
    "town": "Dita",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-gamo-gacho-baba",
    "region": "South Ethiopia",
    "zone": "Gamo",
    "town": "Gacho_Baba",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-gamo-garda-marta",
    "region": "South Ethiopia",
    "zone": "Gamo",
    "town": "Garda Marta",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-gamo-geresse",
    "region": "South Ethiopia",
    "zone": "Gamo",
    "town": "Geresse",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-gamo-geresse-ketema-astedader",
    "region": "South Ethiopia",
    "zone": "Gamo",
    "town": "Geresse Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-gamo-kemba",
    "region": "South Ethiopia",
    "zone": "Gamo",
    "town": "Kemba",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-gamo-kemba-ketema-astedader",
    "region": "South Ethiopia",
    "zone": "Gamo",
    "town": "Kemba Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-gamo-mirab-abaya",
    "region": "South Ethiopia",
    "zone": "Gamo",
    "town": "Mirab Abaya",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-gamo-qogota",
    "region": "South Ethiopia",
    "zone": "Gamo",
    "town": "Qogota",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-gamo-qucha",
    "region": "South Ethiopia",
    "zone": "Gamo",
    "town": "Qucha",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-gamo-qucha-alfa",
    "region": "South Ethiopia",
    "zone": "Gamo",
    "town": "Qucha Alfa",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-gamo-selam-ber-ketema-asetedader",
    "region": "South Ethiopia",
    "zone": "Gamo",
    "town": "Selam Ber Ketema Asetedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-gardula-derashe",
    "region": "South Ethiopia",
    "zone": "Gardula",
    "town": "Derashe",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-gedeo-bule",
    "region": "South Ethiopia",
    "zone": "Gedeo",
    "town": "Bule",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-gedeo-dilla-zuria",
    "region": "South Ethiopia",
    "zone": "Gedeo",
    "town": "Dilla Zuria",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-gedeo-gedeb",
    "region": "South Ethiopia",
    "zone": "Gedeo",
    "town": "Gedeb",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-gedeo-kochore",
    "region": "South Ethiopia",
    "zone": "Gedeo",
    "town": "Kochore",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-gedeo-wonago",
    "region": "South Ethiopia",
    "zone": "Gedeo",
    "town": "Wonago",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-gedeo-yirga-chefe",
    "region": "South Ethiopia",
    "zone": "Gedeo",
    "town": "Yirga Chefe",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-gedeo-yirga-chefe-city-admin",
    "region": "South Ethiopia",
    "zone": "Gedeo",
    "town": "Yirga Chefe City Admin",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-gofa-beto-ketema-astedader",
    "region": "South Ethiopia",
    "zone": "Gofa",
    "town": "Beto Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-gofa-bulki-ketema-asetedader",
    "region": "South Ethiopia",
    "zone": "Gofa",
    "town": "Bulki Ketema Asetedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-gofa-denba-gofa",
    "region": "South Ethiopia",
    "zone": "Gofa",
    "town": "Denba Gofa",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-gofa-geze-gofa",
    "region": "South Ethiopia",
    "zone": "Gofa",
    "town": "Geze Gofa",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-gofa-melo-gada",
    "region": "South Ethiopia",
    "zone": "Gofa",
    "town": "Melo Gada",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-gofa-melo-koza",
    "region": "South Ethiopia",
    "zone": "Gofa",
    "town": "Melo Koza",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-gofa-oyida",
    "region": "South Ethiopia",
    "zone": "Gofa",
    "town": "Oyida",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-gofa-sawula",
    "region": "South Ethiopia",
    "zone": "Gofa",
    "town": "Sawula",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-gofa-uba-debretsehay",
    "region": "South Ethiopia",
    "zone": "Gofa",
    "town": "Uba Debretsehay",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-gofa-zala",
    "region": "South Ethiopia",
    "zone": "Gofa",
    "town": "Zala",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-konso-karate-city-admin",
    "region": "South Ethiopia",
    "zone": "Konso",
    "town": "Karate_City_Admin",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-konso-karate-zuria",
    "region": "South Ethiopia",
    "zone": "Konso",
    "town": "Karate_Zuria",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-konso-kena",
    "region": "South Ethiopia",
    "zone": "Konso",
    "town": "Kena",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-konso-kolme-cluster",
    "region": "South Ethiopia",
    "zone": "Konso",
    "town": "Kolme Cluster",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-konso-segen-zuriya",
    "region": "South Ethiopia",
    "zone": "Konso",
    "town": "Segen_Zuriya",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-korey-amaro",
    "region": "South Ethiopia",
    "zone": "korey",
    "town": "Amaro",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-welayta-abala-abaya",
    "region": "South Ethiopia",
    "zone": "Welayta",
    "town": "Abala Abaya",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-welayta-areka-ketema-astedader",
    "region": "South Ethiopia",
    "zone": "Welayta",
    "town": "Areka Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-welayta-bayra-koysha",
    "region": "South Ethiopia",
    "zone": "Welayta",
    "town": "Bayra Koysha",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-welayta-bele-ketema-astedader",
    "region": "South Ethiopia",
    "zone": "Welayta",
    "town": "Bele Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-welayta-boditi-town",
    "region": "South Ethiopia",
    "zone": "Welayta",
    "town": "Boditi Town",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-welayta-boloso-sore",
    "region": "South Ethiopia",
    "zone": "Welayta",
    "town": "Boloso Sore",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-welayta-bolosobombe",
    "region": "South Ethiopia",
    "zone": "Welayta",
    "town": "Bolosobombe",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-welayta-damot-sore",
    "region": "South Ethiopia",
    "zone": "Welayta",
    "town": "Damot Sore",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-welayta-damot-weyde",
    "region": "South Ethiopia",
    "zone": "Welayta",
    "town": "Damot Weyde",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-welayta-damotgale",
    "region": "South Ethiopia",
    "zone": "Welayta",
    "town": "Damotgale",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-welayta-damotpulasa",
    "region": "South Ethiopia",
    "zone": "Welayta",
    "town": "Damotpulasa",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-welayta-duguna-fango",
    "region": "South Ethiopia",
    "zone": "Welayta",
    "town": "Duguna Fango",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-welayta-gesuba-ketema-astedader",
    "region": "South Ethiopia",
    "zone": "Welayta",
    "town": "Gesuba Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-welayta-gununo-hamuse-ketema-astedader",
    "region": "South Ethiopia",
    "zone": "Welayta",
    "town": "Gununo Hamuse Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-welayta-hobicha-abaya",
    "region": "South Ethiopia",
    "zone": "Welayta",
    "town": "Hobicha Abaya",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-welayta-humbo",
    "region": "South Ethiopia",
    "zone": "Welayta",
    "town": "Humbo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-welayta-kawo-koyisha",
    "region": "South Ethiopia",
    "zone": "Welayta",
    "town": "Kawo Koyisha",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-welayta-kindo-didaye",
    "region": "South Ethiopia",
    "zone": "Welayta",
    "town": "Kindo Didaye",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-welayta-kindo-koisha",
    "region": "South Ethiopia",
    "zone": "Welayta",
    "town": "Kindo Koisha",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-welayta-ofa",
    "region": "South Ethiopia",
    "zone": "Welayta",
    "town": "Ofa",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-welayta-sodo-ketema-astedader",
    "region": "South Ethiopia",
    "zone": "Welayta",
    "town": "Sodo Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-welayta-sodo-zuria",
    "region": "South Ethiopia",
    "zone": "Welayta",
    "town": "Sodo Zuria",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-ethiopia-welayta-tebela-ketema-astedader",
    "region": "South Ethiopia",
    "zone": "Welayta",
    "town": "Tebela Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-west-ethiopia-people-bench-sheko-debub-bench",
    "region": "South West Ethiopia People",
    "zone": "Bench Sheko",
    "town": "Debub Bench",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-west-ethiopia-people-bench-sheko-dizu-gedi",
    "region": "South West Ethiopia People",
    "zone": "Bench Sheko",
    "town": "Dizu-Gedi",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-west-ethiopia-people-bench-sheko-guraferda",
    "region": "South West Ethiopia People",
    "zone": "Bench Sheko",
    "town": "Guraferda",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-west-ethiopia-people-bench-sheko-mizan-aman-ketema-astedader",
    "region": "South West Ethiopia People",
    "zone": "Bench Sheko",
    "town": "Mizan Aman Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-west-ethiopia-people-bench-sheko-semen-benchmaji",
    "region": "South West Ethiopia People",
    "zone": "Bench Sheko",
    "town": "Semen Benchmaji",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-west-ethiopia-people-bench-sheko-shay-bench",
    "region": "South West Ethiopia People",
    "zone": "Bench Sheko",
    "town": "Shay Bench",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-west-ethiopia-people-bench-sheko-sheko",
    "region": "South West Ethiopia People",
    "zone": "Bench Sheko",
    "town": "Sheko",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-west-ethiopia-people-dawro-disa",
    "region": "South West Ethiopia People",
    "zone": "Dawro",
    "town": "Disa",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-west-ethiopia-people-dawro-esera",
    "region": "South West Ethiopia People",
    "zone": "Dawro",
    "town": "Esera",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-west-ethiopia-people-dawro-gena",
    "region": "South West Ethiopia People",
    "zone": "Dawro",
    "town": "Gena",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-west-ethiopia-people-dawro-gena-bosa",
    "region": "South West Ethiopia People",
    "zone": "Dawro",
    "town": "Gena Bosa",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-west-ethiopia-people-dawro-gesa-chare-ketema-astedader",
    "region": "South West Ethiopia People",
    "zone": "Dawro",
    "town": "Gesa Chare Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-west-ethiopia-people-dawro-kechi",
    "region": "South West Ethiopia People",
    "zone": "Dawro",
    "town": "Kechi",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-west-ethiopia-people-dawro-loma",
    "region": "South West Ethiopia People",
    "zone": "Dawro",
    "town": "Loma",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-west-ethiopia-people-dawro-maraka",
    "region": "South West Ethiopia People",
    "zone": "Dawro",
    "town": "Maraka",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-west-ethiopia-people-dawro-mari-mansa",
    "region": "South West Ethiopia People",
    "zone": "Dawro",
    "town": "Mari Mansa",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-west-ethiopia-people-dawro-tarcha-ketema-astedader",
    "region": "South West Ethiopia People",
    "zone": "Dawro",
    "town": "Tarcha Ketema Astedader",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-west-ethiopia-people-dawro-tarcha-zuriya",
    "region": "South West Ethiopia People",
    "zone": "Dawro",
    "town": "Tarcha Zuriya",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-west-ethiopia-people-dawro-tocha",
    "region": "South West Ethiopia People",
    "zone": "Dawro",
    "town": "Tocha",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-west-ethiopia-people-kefa-adiyo",
    "region": "South West Ethiopia People",
    "zone": "Kefa",
    "town": "Adiyo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-west-ethiopia-people-kefa-bita",
    "region": "South West Ethiopia People",
    "zone": "Kefa",
    "town": "Bita",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-west-ethiopia-people-kefa-bonga",
    "region": "South West Ethiopia People",
    "zone": "Kefa",
    "town": "Bonga",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-west-ethiopia-people-kefa-chena",
    "region": "South West Ethiopia People",
    "zone": "Kefa",
    "town": "Chena",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-west-ethiopia-people-kefa-cheta",
    "region": "South West Ethiopia People",
    "zone": "Kefa",
    "town": "Cheta",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-west-ethiopia-people-kefa-decha",
    "region": "South West Ethiopia People",
    "zone": "Kefa",
    "town": "Decha",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-west-ethiopia-people-kefa-gesha-deka",
    "region": "South West Ethiopia People",
    "zone": "Kefa",
    "town": "Gesha Deka",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-west-ethiopia-people-kefa-gewata",
    "region": "South West Ethiopia People",
    "zone": "Kefa",
    "town": "Gewata",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-west-ethiopia-people-kefa-gimbo",
    "region": "South West Ethiopia People",
    "zone": "Kefa",
    "town": "Gimbo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-west-ethiopia-people-kefa-goba",
    "region": "South West Ethiopia People",
    "zone": "Kefa",
    "town": "Goba",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-west-ethiopia-people-kefa-saylem",
    "region": "South West Ethiopia People",
    "zone": "Kefa",
    "town": "Saylem",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-west-ethiopia-people-kefa-sheshoendey",
    "region": "South West Ethiopia People",
    "zone": "Kefa",
    "town": "Sheshoendey",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-west-ethiopia-people-kefa-telo",
    "region": "South West Ethiopia People",
    "zone": "Kefa",
    "town": "Telo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-west-ethiopia-people-kefa-wacha-city-administrator",
    "region": "South West Ethiopia People",
    "zone": "Kefa",
    "town": "Wacha City Administrator",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-west-ethiopia-people-konta-konta-liyu",
    "region": "South West Ethiopia People",
    "zone": "Konta",
    "town": "Konta Liyu",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-west-ethiopia-people-merab-omo-bero",
    "region": "South West Ethiopia People",
    "zone": "Merab Omo",
    "town": "Bero",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-west-ethiopia-people-merab-omo-gachit",
    "region": "South West Ethiopia People",
    "zone": "Merab Omo",
    "town": "Gachit",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-west-ethiopia-people-merab-omo-gori-gesha",
    "region": "South West Ethiopia People",
    "zone": "Merab Omo",
    "town": "Gori Gesha",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-west-ethiopia-people-merab-omo-maji",
    "region": "South West Ethiopia People",
    "zone": "Merab Omo",
    "town": "Maji",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-west-ethiopia-people-merab-omo-menit-goldia",
    "region": "South West Ethiopia People",
    "zone": "Merab Omo",
    "town": "Menit Goldia",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-west-ethiopia-people-merab-omo-menit-shasha",
    "region": "South West Ethiopia People",
    "zone": "Merab Omo",
    "town": "Menit Shasha",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-west-ethiopia-people-merab-omo-surma",
    "region": "South West Ethiopia People",
    "zone": "Merab Omo",
    "town": "Surma",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-west-ethiopia-people-sheka-andracha",
    "region": "South West Ethiopia People",
    "zone": "Sheka",
    "town": "Andracha",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-west-ethiopia-people-sheka-masha",
    "region": "South West Ethiopia People",
    "zone": "Sheka",
    "town": "Masha",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-west-ethiopia-people-sheka-masha-ketema",
    "region": "South West Ethiopia People",
    "zone": "Sheka",
    "town": "Masha Ketema",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-west-ethiopia-people-sheka-tepi-city-admin",
    "region": "South West Ethiopia People",
    "zone": "Sheka",
    "town": "Tepi City Admin",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-south-west-ethiopia-people-sheka-yeki",
    "region": "South West Ethiopia People",
    "zone": "Sheka",
    "town": "Yeki",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-tigray-debub-misrak-degua-temben",
    "region": "Tigray",
    "zone": "Debub Misrak",
    "town": "Degua Temben",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-tigray-debub-misrak-enderta",
    "region": "Tigray",
    "zone": "Debub Misrak",
    "town": "Enderta",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-tigray-debub-misrak-hintalo-wajirat",
    "region": "Tigray",
    "zone": "Debub Misrak",
    "town": "Hintalo Wajirat",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-tigray-debub-misrak-seharti-samre",
    "region": "Tigray",
    "zone": "Debub Misrak",
    "town": "Seharti Samre",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-tigray-debubawi-alaje",
    "region": "Tigray",
    "zone": "Debubawi",
    "town": "Alaje",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-tigray-debubawi-alamata",
    "region": "Tigray",
    "zone": "Debubawi",
    "town": "Alamata",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-tigray-debubawi-alamata-town",
    "region": "Tigray",
    "zone": "Debubawi",
    "town": "Alamata Town",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-tigray-debubawi-endamehoni",
    "region": "Tigray",
    "zone": "Debubawi",
    "town": "Endamehoni",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-tigray-debubawi-korem",
    "region": "Tigray",
    "zone": "Debubawi",
    "town": "Korem",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-tigray-debubawi-maychew",
    "region": "Tigray",
    "zone": "Debubawi",
    "town": "Maychew",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-tigray-debubawi-ofla",
    "region": "Tigray",
    "zone": "Debubawi",
    "town": "Ofla",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-tigray-debubawi-raya-azebo",
    "region": "Tigray",
    "zone": "Debubawi",
    "town": "Raya Azebo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-tigray-mehakelawi-abbi-addy",
    "region": "Tigray",
    "zone": "Mehakelawi",
    "town": "Abbi Addy",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-tigray-mehakelawi-adwa",
    "region": "Tigray",
    "zone": "Mehakelawi",
    "town": "Adwa",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-tigray-mehakelawi-adwa-town",
    "region": "Tigray",
    "zone": "Mehakelawi",
    "town": "Adwa Town",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-tigray-mehakelawi-ahiferom",
    "region": "Tigray",
    "zone": "Mehakelawi",
    "town": "Ahiferom",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-tigray-mehakelawi-axum",
    "region": "Tigray",
    "zone": "Mehakelawi",
    "town": "Axum",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-tigray-mehakelawi-kola-tembyen",
    "region": "Tigray",
    "zone": "Mehakelawi",
    "town": "Kola Tembyen",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-tigray-mehakelawi-laelay-maychew",
    "region": "Tigray",
    "zone": "Mehakelawi",
    "town": "Laelay Maychew",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-tigray-mehakelawi-mereb-leke",
    "region": "Tigray",
    "zone": "Mehakelawi",
    "town": "Mereb Leke",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-tigray-mehakelawi-nader-adet",
    "region": "Tigray",
    "zone": "Mehakelawi",
    "town": "Nader Adet",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-tigray-mehakelawi-tahtaymaychew",
    "region": "Tigray",
    "zone": "Mehakelawi",
    "town": "Tahtaymaychew",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-tigray-mehakelawi-tanqua-abergele",
    "region": "Tigray",
    "zone": "Mehakelawi",
    "town": "Tanqua Abergele",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-tigray-mehakelawi-were-lehe",
    "region": "Tigray",
    "zone": "Mehakelawi",
    "town": "Were Lehe",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-tigray-mekele-adihaki",
    "region": "Tigray",
    "zone": "Mekele",
    "town": "Adihaki",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-tigray-mekele-ayder",
    "region": "Tigray",
    "zone": "Mekele",
    "town": "Ayder",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-tigray-mekele-hadnet",
    "region": "Tigray",
    "zone": "Mekele",
    "town": "Hadnet",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-tigray-mekele-hawelti",
    "region": "Tigray",
    "zone": "Mekele",
    "town": "Hawelti",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-tigray-mekele-kedamay-weyane",
    "region": "Tigray",
    "zone": "Mekele",
    "town": "Kedamay Weyane",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-tigray-mekele-quiha",
    "region": "Tigray",
    "zone": "Mekele",
    "town": "Quiha",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-tigray-mekele-semen",
    "region": "Tigray",
    "zone": "Mekele",
    "town": "Semen",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-tigray-mirabawi-kafta-humera",
    "region": "Tigray",
    "zone": "Mirabawi",
    "town": "Kafta Humera",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-tigray-mirabawi-setit-humera",
    "region": "Tigray",
    "zone": "Mirabawi",
    "town": "Setit Humera",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-tigray-mirabawi-tsegede",
    "region": "Tigray",
    "zone": "Mirabawi",
    "town": "Tsegede",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-tigray-mirabawi-welkayit",
    "region": "Tigray",
    "zone": "Mirabawi",
    "town": "Welkayit",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-tigray-misrakawi-adigrat",
    "region": "Tigray",
    "zone": "Misrakawi",
    "town": "Adigrat",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-tigray-misrakawi-atsbi-wenberta",
    "region": "Tigray",
    "zone": "Misrakawi",
    "town": "Atsbi Wenberta",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-tigray-misrakawi-erob",
    "region": "Tigray",
    "zone": "Misrakawi",
    "town": "Erob",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-tigray-misrakawi-ganta-afeshum",
    "region": "Tigray",
    "zone": "Misrakawi",
    "town": "Ganta Afeshum",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-tigray-misrakawi-gulo-meheda",
    "region": "Tigray",
    "zone": "Misrakawi",
    "town": "Gulo Meheda",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-tigray-misrakawi-hawuzen",
    "region": "Tigray",
    "zone": "Misrakawi",
    "town": "Hawuzen",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-tigray-misrakawi-kilte-awlalo",
    "region": "Tigray",
    "zone": "Misrakawi",
    "town": "Kilte Awlalo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-tigray-misrakawi-saesi-tsadamba",
    "region": "Tigray",
    "zone": "Misrakawi",
    "town": "Saesi Tsadamba",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-tigray-misrakawi-wukro",
    "region": "Tigray",
    "zone": "Misrakawi",
    "town": "Wukro",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-tigray-semen-mirab-asegede-tsimbila",
    "region": "Tigray",
    "zone": "Semen Mirab",
    "town": "Asegede Tsimbila",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-tigray-semen-mirab-laelay-adiyabo",
    "region": "Tigray",
    "zone": "Semen Mirab",
    "town": "Laelay Adiyabo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-tigray-semen-mirab-medebay-zana",
    "region": "Tigray",
    "zone": "Semen Mirab",
    "town": "Medebay Zana",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-tigray-semen-mirab-shiraro",
    "region": "Tigray",
    "zone": "Semen Mirab",
    "town": "Shiraro",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-tigray-semen-mirab-shire-enda-silassie",
    "region": "Tigray",
    "zone": "Semen Mirab",
    "town": "Shire Enda Silassie",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-tigray-semen-mirab-tahtay-adiyabo",
    "region": "Tigray",
    "zone": "Semen Mirab",
    "town": "Tahtay Adiyabo",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-tigray-semen-mirab-tahtay-qoraro",
    "region": "Tigray",
    "zone": "Semen Mirab",
    "town": "Tahtay Qoraro",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  },
  {
    "id": "admin-tigray-semen-mirab-tselemt",
    "region": "Tigray",
    "zone": "Semen Mirab",
    "town": "Tselemt",
    "source": "Region, Zone, Town.odt",
    "sourcePath": "Region, Zone, Town.odt"
  }
] as EthiopianAdministrativePlace[];

export function getEthiopianAdministrativeHierarchy(): EthiopianAdministrativeRegion[] {
  const regions = new Map<string, Map<string, Map<string, string>>>();
  for (const place of ETHIOPIAN_ADMINISTRATIVE_PLACES) {
    let zones = regions.get(place.region);
    if (!zones) {
      zones = new Map();
      regions.set(place.region, zones);
    }

    let towns = zones.get(place.zone);
    if (!towns) {
      towns = new Map();
      zones.set(place.zone, towns);
    }
    towns.set(place.town.trim().toLocaleLowerCase(), place.town);
  }

  return [...regions.entries()]
    .map(([name, zones]) => {
      const mappedZones = [...zones.entries()]
        .map(([zoneName, towns]) => ({
          name: zoneName,
          towns: [...towns.values()].sort((a, b) => a.localeCompare(b)),
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
      return {
        name,
        zones: mappedZones,
        townCount: mappedZones.reduce((total, zone) => total + zone.towns.length, 0),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

const normalize = (value: string) => value.trim().toLocaleLowerCase();

export function searchEthiopianAdministrativePlaces(query: string, region?: string, zone?: string): EthiopianAdministrativePlace[] {
  const q = normalize(query);
  const regionQuery = region ? normalize(region) : "";
  const zoneQuery = zone ? normalize(zone) : "";
  return ETHIOPIAN_ADMINISTRATIVE_PLACES.filter((place) =>
    (!regionQuery || normalize(place.region) === regionQuery) &&
    (!zoneQuery || normalize(place.zone) === zoneQuery) &&
    (!q || [place.region, place.zone, place.town].some((value) => normalize(value).includes(q))),
  );
}
